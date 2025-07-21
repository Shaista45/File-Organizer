from flask import Flask, render_template, request, jsonify
import os
import shutil

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

file_types = {
    "Images": ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
    "Documents": ['.doc', '.docx', '.txt', '.odt'],
    "PDFs": ['.pdf'],
    "Videos": ['.mp4', '.mov', '.avi', '.mkv'],
    "Music": ['.mp3', '.wav', '.aac'],
    "Compressed": ['.zip', '.rar', '.7z'],
    "Scripts": ['.py', '.js', '.html', '.css'],
    "Spreadsheets": ['.xls', '.xlsx', '.csv'],
    "Presentations": ['.ppt', '.pptx'],
    "Others": []
}
def get_file_category(extension):
    for category, extensions in file_types.items():
        if extension.lower() in extensions:
            return category
    return "Others"

@app.route('/organize', methods=['POST'])
def organize():
    data = request.get_json()
    folder_path = data.get('folderPath')

    if not folder_path or not os.path.exists(folder_path):
        return jsonify({"error": "Invalid folder path"}), 400

    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path):
            ext = os.path.splitext(filename)[1]
            category = get_file_category(ext)
            category_folder = os.path.join(folder_path, category)
            os.makedirs(category_folder, exist_ok=True)
            shutil.move(file_path, os.path.join(category_folder, filename))

    return jsonify({"message": "Files organized successfully."})

if __name__ == '__main__':
    app.run(debug=True)