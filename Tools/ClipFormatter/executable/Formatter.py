import os
import subprocess
import tkinter as tk
from tkinter import scrolledtext

class FormatterGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Clipboard Code Formatter")

        # Instruction Label
        tk.Label(root, text="Copy your code to the clipboard, then click 'Format Code'").grid(row=0, column=0, columnspan=3, padx=5, pady=5)

        # Line Number Field Width
        tk.Label(root, text="Line Number Width:").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.number_width_entry = tk.Entry(root, width=5)
        self.number_width_entry.grid(row=1, column=1, padx=(5, 20), pady=5, sticky="w")
        self.number_width_entry.insert(0, "2")  # Default value

        # Indent Size
        tk.Label(root, text="Indent Size:").grid(row=2, column=0, padx=5, pady=5, sticky="w")
        self.indent_size_entry = tk.Entry(root, width=5)
        self.indent_size_entry.grid(row=2, column=1, padx=(5, 20), pady=5, sticky="w")
        self.indent_size_entry.insert(0, "2")  # Default value

        # Format Button
        self.run_button = tk.Button(root, text="Format Code", command=self.run_formatter)
        self.run_button.grid(row=3, column=0, pady=5)

        # Copy Output Button
        self.copy_button = tk.Button(root, text="Copy Output", command=self.copy_to_clipboard)
        self.copy_button.grid(row=3, column=1, pady=5, padx=5)

        # Output Window
        self.output_text = scrolledtext.ScrolledText(root, width=80, height=20)
        self.output_text.grid(row=4, column=0, columnspan=3, padx=5, pady=5)

    def run_formatter(self):
        exe_path = os.path.join(os.getcwd(), "Formatter.exe")

        if not os.path.exists(exe_path):
            self.output_text.insert(tk.END, "Formatter.exe not found in the current directory.\n")
            return

        # Get user input for line number width and indent size
        number_width = self.number_width_entry.get().strip()
        indent_size = self.indent_size_entry.get().strip()

        try:
            # Run the formatter with custom arguments
            result = subprocess.run(
                [exe_path, number_width, indent_size], capture_output=True, text=True
            )

            # Display output in the text box
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
