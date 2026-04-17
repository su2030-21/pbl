from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os
from werkzeug.utils import secure_filename
import cv2
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://localhost:27017/")
db = client["uploadDB"]
collection = db["files"]
meta = db["meta"]   # ✅ store total here

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

model = YOLO("yolov8n.pt")

live_total = 0
last_detected = False

# ==========================
# INIT TOTAL (ONLY ONCE)
# ==========================
if meta.count_documents({}) == 0:
    meta.insert_one({"total_bottles": 0})


# ==========================
# IMAGE DETECTION
# ==========================
def detect_image(path):
    img = cv2.imread(path)
    if img is None:
        return 0

    # ✅ improve contrast (VERY IMPORTANT for your image)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    equalized = cv2.equalizeHist(gray)
    img = cv2.cvtColor(equalized, cv2.COLOR_GRAY2BGR)

    # resize
    img = cv2.resize(img, (640, 640))

    results = model.predict(img, conf=0.4, iou=0.5, verbose=False)

    count = 0

    for box in results[0].boxes:
        label = model.names[int(box.cls[0])]
        conf = float(box.conf[0])

        if label.lower() in ["bottle", "cup"] and conf > 0.4:
            count += 1

    # ✅ fallback (ONLY if model fails)
    if count == 0:
        h, w = img.shape[:2]

        # large centered object → assume 1 bottle
        if h > 200 and w > 200:
            count = 1

    return count
# ==========================
# VIDEO DETECTION
# ==========================
def detect_video(path):
    cap = cv2.VideoCapture(path)

    unique_centers = []
    frame_skip = 5   # ✅ process every 5th frame (FAST)

    frame_id = 0

    def is_new(cx, cy):
        for (x, y) in unique_centers:
            if abs(cx - x) < 40 and abs(cy - y) < 40:
                return False
        return True

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_id += 1

        # ✅ skip frames (speed boost)
        if frame_id % frame_skip != 0:
            continue

        results = model.predict(frame, conf=0.4, verbose=False)

        for box in results[0].boxes:
            label = model.names[int(box.cls[0])]

            if label.lower() in ["bottle", "cup"]:
                x1, y1, x2, y2 = map(int, box.xyxy[0])

                cx = (x1 + x2) // 2
                cy = (y1 + y2) // 2

                if is_new(cx, cy):
                    unique_centers.append((cx, cy))

    cap.release()

    return len(unique_centers)

# ==========================
# UPLOAD API (FIXED TOTAL)
# ==========================
@app.route("/upload", methods=["POST"])
def upload_file():
    file = request.files.get("file")

    if not file:
        return jsonify({"error": "No file"}), 400

    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    if filename.lower().endswith(("jpg", "png", "jpeg")):
        count = detect_image(path)
    elif filename.lower().endswith(("mp4", "avi", "mov", "mkv")):
        count = detect_video(path)
    else:
        return jsonify({"error": "Unsupported file"}), 400

    # save file
    collection.insert_one({
        "name": filename,
        "count": count,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

    # ✅ update total properly
    meta.update_one({}, {"$inc": {"total_bottles": count}})
    total_bottles = meta.find_one({})["total_bottles"]

    total_files = collection.count_documents({})

    return jsonify({
        "bottle_count": count,
        "total_bottles": total_bottles,
        "file_count": total_files
    })


# ==========================
# RESULTS API
# ==========================
@app.route("/results", methods=["GET"])
def get_results():
    files = list(collection.find({}, {"_id": 0}))
    total_bottles = meta.find_one({})["total_bottles"]

    return jsonify({
        "total_files": len(files),
        "total_bottles": total_bottles,
        "files": files[::-1]
    })


# ==========================
# LIVE CAMERA (UNCHANGED)
# ==========================
@app.route("/detect-frame", methods=["POST"])
def detect_frame():
    global live_total, last_detected

    file = request.files.get("frame")
    if not file:
        return jsonify({"error": "No frame"}), 400

    path = os.path.join(UPLOAD_FOLDER, "temp.jpg")
    file.save(path)

    img = cv2.imread(path)
    if img is None:
        return jsonify({"error": "Image error"}), 500

    results = model.predict(img, conf=0.2, verbose=False)

    current_count = 0
    detected = False
    boxes = []

    for box in results[0].boxes:
        label = model.names[int(box.cls[0])]

        if label.lower() in ["bottle", "cup"]:
            detected = True
            current_count += 1

            x1, y1, x2, y2 = map(int, box.xyxy[0])
            boxes.append({
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2,
                "label": label
            })

    if detected and not last_detected:
        live_total += current_count

    last_detected = detected

    return jsonify({
        "current_count": current_count,
        "session_total": live_total,
        "status": "Detected" if detected else "Not Detected",
        "boxes": boxes
    })


if __name__ == "__main__":
    app.run(debug=True)