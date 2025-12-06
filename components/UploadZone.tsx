import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface UploadZoneProps {
  label: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ label, file, onFileSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      
      {!file ? (
        <div 
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-rose-200 bg-white hover:border-rose-400 hover:bg-rose-50/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all h-32 group"
        >
          <div className="p-2 bg-rose-50 rounded-full mb-2 group-hover:bg-rose-100 transition-colors">
             <Upload className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-[10px] text-center text-stone-400 font-medium">Click or Drag & Drop</p>
          <input 
            type="file" 
            ref={inputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="relative group border border-rose-200 rounded-xl overflow-hidden h-32 bg-white shadow-sm">
          <img 
            src={URL.createObjectURL(file)} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button 
            onClick={() => onFileSelect(null)}
            className="absolute top-2 right-2 bg-white/90 hover:bg-rose-500 hover:text-white p-1.5 rounded-full text-rose-500 shadow-sm transition-all"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-1.5 border-t border-rose-100">
             <p className="text-[10px] text-stone-600 truncate px-2 font-medium">{file.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadZone;