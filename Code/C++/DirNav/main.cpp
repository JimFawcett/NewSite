#include "WinDirTraversal.h"
#include <iostream>
#include <iomanip>
#include <sstream>
#include <string>
#include <cstdlib>
#include <limits>

// Helper function to format file size in bytes
std::string FormatFileSize(LONGLONG size)
{
    std::stringstream ss;
    // Note: Standard C++ formatting is harder with narrow streams than with wide streams on Windows.
    // For simplicity, we just output the number without thousands separators.
    ss << size; 
    return ss.str();
}

/**
 * @brief Callback function to process each file system entry, using narrow characters.
 */
void ProcessEntry(const std::string& fullPath, const WIN32_FIND_DATAA& findData)
{
    bool isDirectory = (findData.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) != 0;

    // Output the name first, followed by details
    std::cout << findData.cFileName;

    if (isDirectory)
    {
        std::cout << "\t[DIR]";
    }
    else
    {
        LARGE_INTEGER fileSize;
        fileSize.LowPart = findData.nFileSizeLow;
        fileSize.HighPart = findData.nFileSizeHigh;
        
        std::cout << "\t[FILE]\t" << FormatFileSize(fileSize.QuadPart) << " bytes";
    }

    std::cout << " | Path: " << fullPath << std::endl;
}

// *** STANDARD ASCII/NARROW ENTRY POINT ***
int main(int argc, char* argv[])
{
    if (argc != 2)
    {
        std::cout << "Usage: " << argv[0] << " <Start Directory Path>" << std::endl;
        std::cout << "Example: " << argv[0] << " C:\\Users\\Public" << std::endl;
        
        // PAUSE for display when double-clicked on invalid input
        std::cout << "\nPress Enter to exit..." << std::endl;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        
        return 1;
    }

    std::string startPath = argv[1];
    
    std::cout << "🚀 Starting recursive directory traversal..." << std::endl;
    std::cout << "Root Path: " << startPath << std::endl;
    std::cout << "----------------------------------------------------------------------" << std::endl;

    // Call the traversal function
    WinDir::TraverseDirectory(startPath, ProcessEntry);

    std::cout << "----------------------------------------------------------------------" << std::endl;
    std::cout << "✅ Traversal complete." << std::endl;

    // Final pause logic for double-click execution (reusing std::cin.ignore for simplicity)
    std::cout << "\nPress Enter to exit..." << std::endl;
    // Clear and ignore to reliably pause the console
    std::cin.clear(); 
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n'); 

    return 0;
}