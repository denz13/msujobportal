import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCEPT = 'image/jpeg,image/png,image/jpg,image/gif,image/webp';
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

type ImageDropzoneProps = {
    name: string;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    className?: string;
    disabled?: boolean;
    hint?: string;
    error?: string;
};

export function ImageDropzone({
    name,
    inputRef: externalRef,
    className,
    disabled,
    hint = 'Optional. JPEG, PNG, GIF or WebP. Max 2MB.',
    error,
}: ImageDropzoneProps) {
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = externalRef ?? internalRef;
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const setFileToInput = (file: File | null) => {
        if (!inputRef.current) return;
        if (file) {
            const dt = new DataTransfer();
            dt.items.add(file);
            inputRef.current.files = dt.files;
        } else {
            inputRef.current.value = '';
        }
    };

    const validateAndSet = (file: File): boolean => {
        setErrorMsg(null);
        if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/i)) {
            setErrorMsg('Please choose a JPEG, PNG, GIF or WebP image.');
            return false;
        }
        if (file.size > MAX_SIZE) {
            setErrorMsg('Image must be 2MB or smaller.');
            return false;
        }
        return true;
    };

    const handleFile = (file: File | null) => {
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setFileName(null);
        setFileToInput(null);
        if (!file) return;
        if (!validateAndSet(file)) return;
        setFileName(file.name);
        setPreview(URL.createObjectURL(file));
        setFileToInput(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        handleFile(file ?? null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (disabled) return;
        const file = e.dataTransfer.files?.[0];
        handleFile(file ?? null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleClick = () => {
        if (disabled) return;
        inputRef.current?.click();
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleFile(null);
    };

    const displayError = error ?? errorMsg;

    return (
        <div className={cn('space-y-2', className)}>
            <input
                ref={inputRef}
                type="file"
                name={name}
                accept={ACCEPT}
                onChange={handleChange}
                className="sr-only"
                tabIndex={-1}
                aria-hidden
            />
            {preview ? (
                <div className="relative inline-block rounded-lg border border-border bg-muted/30 p-2">
                    <div className="flex items-center gap-3">
                        <img
                            src={preview}
                            alt="Preview"
                            className="h-20 w-20 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                                {fileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Click or drop to replace
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={disabled}
                            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                            aria-label="Remove image"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={disabled}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
                        dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50',
                        disabled && 'cursor-not-allowed opacity-60',
                    )}
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">
                            Drag & drop or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                            JPEG, PNG, GIF or WebP · Max 2MB
                        </p>
                    </div>
                </button>
            )}
            {hint && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
            {displayError && (
                <p className="text-sm text-destructive">{displayError}</p>
            )}
        </div>
    );
}
