// #ifndef WIN_DIR_TRAVERSAL_H
// #define WIN_DIR_TRAVERSAL_H

#pragma once

#define WIN32_LEAN_AND_MEAN
// #define NOMINMAX // Essential for std::numeric_limits<...>::max() compatibility
#include <windows.h>
#include <string>
#include <functional>

namespace WinDir
{
    // *** NARROW CHARACTER CALLBACK DEFINITION ***
    // Uses std::string for ASCII/narrow paths and names.
    using TraversalCallback = std::function<
        void(const std::string& fullPath, const WIN32_FIND_DATAA& findData)
    >;

    /**
     * @brief Recursively traverses a directory structure using narrow characters.
     * * @param rootPath The starting path (e.g., "C:\\Users").
     * @param callback The function to call for each file system entry.
     */
    inline void TraverseDirectory(const std::string& rootPath, TraversalCallback callback)
    {
        std::string searchPath = rootPath + "\\*";
        WIN32_FIND_DATAA findData;
        
        HANDLE hFind = FindFirstFileA(searchPath.c_str(), &findData);

        if (hFind == INVALID_HANDLE_VALUE) {
            // Handle error (e.g., print access denied or path not found)
            return;
        }

        do {
            const std::string filename = findData.cFileName;

            // Skip "." and ".."
            if (filename == "." || filename == "..") {
                continue;
            }

            // Construct the full path
            std::string fullPath = rootPath + "\\" + filename;

            // Call the user-defined callback function
            callback(fullPath, findData);

            // If it's a directory, recurse (excluding symlinks)
            if ((findData.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) && 
                !(findData.dwFileAttributes & FILE_ATTRIBUTE_REPARSE_POINT)) 
            {
                TraverseDirectory(fullPath, callback);
            }

        } while (FindNextFileA(hFind, &findData) != 0);

        FindClose(hFind);
    }
}
// #endif