import { useRef } from 'react'
import { FileUploaderRegular } from '@uploadcare/react-uploader'
import '@uploadcare/react-uploader/core.css'
import { X, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ImageUpload({ 
  currentImage, 
  onImageChange, 
  publicKey,
  label = "Profile Picture",
  className = "" 
}) {
  const uploaderRef = useRef(null)
  const latestFileRef = useRef(null)

  const handleRemoveImage = () => {
    onImageChange('')
    toast.success('Image removed')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-gray-300 mb-2 font-medium">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="w-4 h-4" />
          {label}
        </div>
      </label>

      <div className="flex flex-col items-center gap-4">
        {/* Image Preview */}
        {currentImage && (
          <div className="relative group">
            <img
              src={currentImage}
              alt="Profile preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Uploadcare File Uploader */}
        <div className="w-full uploadcare-container">
          <FileUploaderRegular
            apiRef={uploaderRef}
            sourceList="local,camera"
            classNameUploader="uc-dark"
            pubkey={publicKey}
            cropPreset="1:1"
            onChange={(items) => {
              const successFile = items.allEntries.find(
                (f) => f.status === "success"
              )
              if (successFile) {
                latestFileRef.current = successFile
                console.log("File uploaded:", successFile.cdnUrl)
              }
            }}
            onDoneClick={() => {
              if (latestFileRef.current) {
                const imageUrl = latestFileRef.current.cdnUrl
                onImageChange(imageUrl)
                toast.success('Image uploaded successfully!')
                latestFileRef.current = null
              }
            }}
            multiple={false}
            imgOnly={true}
            useCloudImageEditor={true}
            maxLocalFileSizeBytes={5000000}
          />
        </div>

        <p className="text-sm text-gray-400 text-center">
          Recommended: Square image, max 5MB
        </p>
      </div>

      <style jsx="true">{`
        .uploadcare-container {
          --uc-color-primary: rgb(168 85 247);
          --uc-color-primary-hover: rgb(147 51 234);
        }
      `}</style>
    </div>
  )
}
