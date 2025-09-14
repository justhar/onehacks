import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/lib/supabase";

export default function ImageUpload({
  currentImageUrl,
  onImageChange,
  disabled = false,
  folder = "products",
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || "");

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      const result = await uploadImage(file, folder);

      if (result.success) {
        onImageChange(result.url);
        // Clean up preview URL
        URL.revokeObjectURL(preview);
      } else {
        setUploadError(result.error);
        setPreviewUrl(currentImageUrl || "");
      }
    } catch (error) {
      setUploadError("Failed to upload image. Please try again.");
      setPreviewUrl(currentImageUrl || "");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    onImageChange("");
    setUploadError("");
  };

  return (
    <div className="space-y-4">
      <Label>Product Image</Label>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
        {previewUrl ? (
          // Image Preview
          <div className="relative">
            <img
              src={previewUrl}
              alt="Product preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          // Upload Prompt
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <div className="mt-4">
              <Label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={disabled || isUploading}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        )}
      </div>

      {/* Upload Error */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Alternative URL Input */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Or enter image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          value={previewUrl}
          onChange={(e) => {
            setPreviewUrl(e.target.value);
            onImageChange(e.target.value);
          }}
          placeholder="https://example.com/image.jpg"
          disabled={disabled || isUploading}
        />
      </div>
    </div>
  );
}
