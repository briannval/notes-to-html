"use client";
import axios from "axios";
import { ChangeEvent, useState } from "react";
import NoFileLabel from "./components/noFileLabel";
import FileLabel from "./components/fileLabel";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDownload = (htmlContent: string) => {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "download.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getBase64 = (file: File) => {
    return new Promise((resolve) => {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }
    setLoading(true);
    try {
      const baseUrl = await getBase64(file);
      const res = await axios.post("/api/convert", { image: baseUrl });
      if (res.status !== 200) {
        console.error(`Request failed with status ${res.status}`);
        return;
      }
      const htmlCode = res.data.data
        .replace("```", "")
        .replace("html", "")
        .trim();
      handleDownload(htmlCode);
    } catch (error) {
      console.error("An error occurred during submission:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="text-5xl font-mono">Your Notes to HTML. Fast.</div>
      <div className="text-3xl font-mono mt-8">{new Date().toDateString()}</div>
      <div className="flex items-center justify-center w-3/4 mt-24">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          {file ? <FileLabel fileName={file.name} /> : <NoFileLabel />}
          <input
            disabled={file != null}
            id="dropzone-file"
            accept="image/*"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
      {file && (
        <div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-12 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
          <button
            type="button"
            onClick={() => setFile(null)}
            disabled={loading}
            className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          >
            Clear
          </button>
        </div>
      )}
    </main>
  );
}
