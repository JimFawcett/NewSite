// HelloWin.cpp

#include <windows.h>

extern "C" int WINAPI mainCRTStartup() {
  HANDLE hStdOut = GetStdHandle(STD_OUTPUT_HANDLE);
  const char hstr[] = "\n  Hello Basics World\n";
  DWORD hbytesWritten;
  WriteFile(hStdOut, hstr, sizeof(hstr) - 1, &hbytesWritten, NULL);

  const char estr[] = "\n  -- That's all Folks! --\n\n";
  DWORD ebytesWritten;
  WriteFile(hStdOut, estr, sizeof(estr) - 1, &ebytesWritten, NULL);
  return 0;
}