import { X } from 'lucide-react';

interface IImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageURL: string;
}

export default function ImageModal({ isOpen, onClose, imageURL }: IImageModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl max-h-[90vh] w-auto h-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
        >
          <X size={24} />
        </button>
        <img
          src={imageURL}
          alt="확대된 이미지"
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>
    </div>
  );
} 