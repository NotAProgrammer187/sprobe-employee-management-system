<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileController extends Controller
{
    /**
     * Upload file
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'type' => 'required|in:document,image,avatar',
        ]);

        $file = $request->file('file');
        $type = $request->type;

        // Validate file type based on upload type
        $this->validateFileType($file, $type);

        // Generate unique filename
        $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
        
        // Store file
        $path = $file->storeAs("uploads/{$type}s", $filename, 'public');

        return response()->json([
            'message' => 'File uploaded successfully',
            'data' => [
                'filename' => $filename,
                'original_name' => $file->getClientOriginalName(),
                'path' => $path,
                'url' => Storage::url($path),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]
        ], Response::HTTP_CREATED);
    }

    /**
     * Download file
     */
    public function download($filename)
    {
        // Security check - prevent directory traversal
        if (str_contains($filename, '..') || str_contains($filename, '/') || str_contains($filename, '\\')) {
            return response()->json(['message' => 'Invalid filename'], 400);
        }

        // Check in all upload directories
        $directories = ['documents', 'images', 'avatars'];
        $filePath = null;

        foreach ($directories as $dir) {
            $path = "uploads/{$dir}/{$filename}";
            if (Storage::disk('public')->exists($path)) {
                $filePath = $path;
                break;
            }
        }

        if (!$filePath) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::disk('public')->download($filePath);
    }

    /**
     * Delete file
     */
    public function delete($filename)
    {
        // Security check
        if (str_contains($filename, '..') || str_contains($filename, '/') || str_contains($filename, '\\')) {
            return response()->json(['message' => 'Invalid filename'], 400);
        }

        $directories = ['documents', 'images', 'avatars'];
        $deleted = false;

        foreach ($directories as $dir) {
            $path = "uploads/{$dir}/{$filename}";
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                $deleted = true;
                break;
            }
        }

        if (!$deleted) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return response()->json(['message' => 'File deleted successfully']);
    }

    /**
     * Validate file type based on upload type
     */
    private function validateFileType($file, $type)
    {
        $mimeType = $file->getMimeType();

        switch ($type) {
            case 'image':
            case 'avatar':
                if (!str_starts_with($mimeType, 'image/')) {
                    throw new \InvalidArgumentException('File must be an image');
                }
                break;
            case 'document':
                $allowedTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/plain',
                    'text/csv',
                ];
                if (!in_array($mimeType, $allowedTypes)) {
                    throw new \InvalidArgumentException('Invalid document type');
                }
                break;
        }
    }
}