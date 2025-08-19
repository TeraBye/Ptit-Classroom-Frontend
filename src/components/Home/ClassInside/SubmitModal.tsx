"use client";

import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SubmitModalProps {
  onClose: () => void;
  onSubmit: (note: string, file: File | null) => void;
  disabled?: boolean;
  submittedData?: {
    id?: number;
    submitTime?: string;
    note?: string;
    fileUrl?: string;
    studentUsername?: string;
  } | null;
}

export function SubmitModal({ onClose, onSubmit, disabled = false, submittedData = null }: SubmitModalProps) {
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);

  const isSubmitted = disabled || Boolean(submittedData);

  const handleSubmit = () => {
    onSubmit(note, file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[500px] p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Submit assignment</h2>

        <div className="space-y-4">
          {submittedData && (
            <div className="p-4 border rounded bg-gray-50">
              <div className="font-medium text-sm">Bạn đã nộp</div>
              {submittedData.submitTime && (
                <div className="text-xs text-gray-500">Nộp lúc: {submittedData.submitTime}</div>
              )}
              {submittedData.note && <p className="mt-2">{submittedData.note}</p>}
              {submittedData.fileUrl && (
                <button
                  type="button"
                  className="text-blue-500 text-sm hover:underline mt-2 inline-block"
                  onClick={() => {
                    setPreviewUrl(submittedData.fileUrl || null);
                    setShowFilePreview(true);
                  }}
                >
                  📄 Xem file
                </button>
              )}
            </div>
          )}

          {!isSubmitted ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter your notes..."
                className="w-full"
              />

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attached file
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      {file ? file.name : 'Drag and drop files or click to upload'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] || null;
                      setFile(selectedFile);
                      if (selectedFile) {
                        setPreviewUrl(URL.createObjectURL(selectedFile));
                        setShowFilePreview(true);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitted}>
              {isSubmitted ? "Submitted" : "Submit"}
            </Button>
          </div>
        </div>
        {/* File preview overlay inside modal */}
        {showFilePreview && previewUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl h-4/5 p-4 relative">
              <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowFilePreview(false)}>✕</button>
              <div className="h-full overflow-auto">
                {/* Image preview */}

                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title="file-preview"
                  style={{ border: "none" }}
                />

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
