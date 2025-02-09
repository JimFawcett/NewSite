import os
import subprocess
import tkinter as tk
from tkinter import filedialog, scrolledtext

class FormatterGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Code Formatter GUI")

        # File Selection
        tk.Label(root, text="Select a file:").grid(row=0, column=0, padx=5, pady=5, sticky="w")

        self.file_entry = tk.Entry(root, width=50)
        self.file_entry.grid(row=0, column=1, padx=5, pady=5)

        self.browse_button = tk.Button(root, text="Browse", command=self.browse_file)
        self.browse_button.grid(row=0, column=2, padx=5, pady=5)

        # Number Field Width
        tk.Label(root, text="Number Field Width:").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.number_width_entry = tk.Entry(root, width=5)
        self.number_width_entry.grid(row=1, column=1, padx=5, pady=5, sticky="w")
        self.number_width_entry.insert(0, "2")  # Default value

        # Indent Width
        tk.Label(root, text="Indent Width:").grid(row=2, column=0, padx=5, pady=5, sticky="w")
        self.indent_width_entry = tk.Entry(root, width=5)
        self.indent_width_entry.grid(row=2, column=1, padx=5, pady=5, sticky="w")
        self.indent_width_entry.insert(0, "2")  # Default value

        # Run Button
        self.run_button = tk.Button(root, text="Run Formatter", command=self.run_formatter)
        self.run_button.grid(row=3, column=0, columnspan=3, pady=5)

        # Copy Output Button
        self.copy_button = tk.Button(root, text="Copy Output", command=self.copy_to_clipboard)
        self.copy_button.grid(row=3, column=2, pady=5, padx=5)

        # Output Window
        self.output_text = scrolledtext.ScrolledText(root, width=80, height=20)
        self.output_text.grid(row=4, column=0, columnspan=3, padx=5, pady=5)

    def browse_file(self):
        file_path = filedialog.askopenfilename(filetypes=[("All Files", "*.*")])
        if file_path:
            self.file_entry.delete(0, tk.END)
            self.file_entry.insert(0, file_path)

    def run_formatter(self):
        file_path = self.file_entry.get().strip()
        number_width = self.number_width_entry.get().strip()
        indent_width = self.indent_width_entry.get().strip()

        if not file_path:
            self.output_text.insert(tk.END, "Please select a file.\n")
            return

        exe_path = os.path.join(os.getcwd(), "Formatter.exe")

        if not os.path.exists(exe_path):
            self.output_text.insert(tk.END, "Formatter.exe not found in the current directory.\n")
            return

        try:
            result = subprocess.run(
                [exe_path, file_path, number_width, indent_width],
                capture_output=True, text=True
            )
            self.output_text.delete("1.0", tk.END)
            self.output_text.insert(tk.END, result.stdout)
            if result.stderr:
                self.output_text.insert(tk.END, "\nError:\n" + result.stderr)
        except Exception as e:
            self.output_text.insert(tk.END, f"Error running Formatter.exe: {e}\n")

    def copy_to_clipboard(self):
        formatted_text = self.output_text.get("1.0", tk.END).strip()
        if formatted_text:
            self.root.clipboard_clear()
            self.root.clipboard_append(formatted_text)
            self.root.update()  # Keeps clipboard available after closing window

if __name__ == "__main__":
    root = tk.Tk()
    app = FormatterGUI(root)
    root.mainloop()
