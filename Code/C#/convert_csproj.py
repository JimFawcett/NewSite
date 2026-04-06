#!/usr/bin/env python3
"""
Bulk-convert legacy .NET Framework .csproj files to SDK-style format targeting net8.0.
"""

import os
import re
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(r"C:/github/JimFawcett/NewSite/Code/C#")

SKIP_SEGMENTS = {"bin", "obj", "Backup", "Backup1", "Backup2"}

WPF_REFS = {"PresentationCore", "PresentationFramework", "WindowsBase"}


def should_skip_path(path: Path) -> bool:
    parts = set(path.parts)
    return bool(parts & SKIP_SEGMENTS)


def is_legacy(content: str) -> bool:
    return bool(
        re.search(r'<Project\s+DefaultTargets\s*=\s*"Build"', content)
        or re.search(r'<Project\s+ToolsVersion', content)
    )


def is_sdk_style(content: str) -> bool:
    return bool(re.search(r'<Project\s+Sdk\s*=', content))


def is_wpf_project(content: str, csproj_path: Path) -> bool:
    # Check references in csproj
    for ref in WPF_REFS:
        if ref in content:
            return True
    # Check for .xaml files in the same directory
    proj_dir = csproj_path.parent
    if any(proj_dir.glob("*.xaml")):
        return True
    return False


def extract_value(content: str, tag: str) -> str:
    """Extract the text content of an XML tag using regex."""
    m = re.search(rf'<{tag}[^>]*>(.*?)</{tag}>', content, re.DOTALL)
    if m:
        return m.group(1).strip()
    return ""


def has_assembly_info(csproj_path: Path) -> bool:
    return (csproj_path.parent / "Properties" / "AssemblyInfo.cs").exists()


def build_sdk_csproj(
    output_type: str,
    target_framework: str,
    root_namespace: str,
    assembly_name: str,
    use_wpf: bool,
    gen_assembly_info: bool,
    nullable: bool = True,
) -> str:
    lines = ['<Project Sdk="Microsoft.NET.Sdk">', "", "  <PropertyGroup>"]

    lines.append(f"    <OutputType>{output_type}</OutputType>")
    lines.append(f"    <TargetFramework>{target_framework}</TargetFramework>")

    if root_namespace:
        lines.append(f"    <RootNamespace>{root_namespace}</RootNamespace>")
    if assembly_name:
        lines.append(f"    <AssemblyName>{assembly_name}</AssemblyName>")

    if use_wpf:
        lines.append("    <UseWPF>true</UseWPF>")

    if nullable:
        lines.append("    <Nullable>enable</Nullable>")

    if gen_assembly_info:
        lines.append("    <GenerateAssemblyInfo>false</GenerateAssemblyInfo>")

    lines.append("  </PropertyGroup>")
    lines.append("")
    lines.append("</Project>")
    lines.append("")

    return "\n".join(lines)


def convert_csproj(csproj_path: Path) -> str:
    """
    Returns one of: 'converted', 'skip_sdk', 'skip_path'
    """
    # Check path segments
    rel = csproj_path.relative_to(ROOT)
    for part in rel.parts[:-1]:  # exclude the filename itself
        if part in SKIP_SEGMENTS:
            return "skip_path"

    content = csproj_path.read_text(encoding="utf-8", errors="replace")

    if is_sdk_style(content):
        return "skip_sdk"

    if not is_legacy(content):
        # Not recognized as legacy, skip
        return "skip_sdk"

    wpf = is_wpf_project(content, csproj_path)

    # Determine OutputType
    output_type = extract_value(content, "OutputType")
    if not output_type:
        output_type = "Exe"
    # WPF projects should use WinExe
    if wpf and output_type.lower() == "exe":
        output_type = "WinExe"

    target_framework = "net8.0-windows" if wpf else "net8.0"

    root_namespace = extract_value(content, "RootNamespace")
    assembly_name = extract_value(content, "AssemblyName")

    gen_assembly_info = has_assembly_info(csproj_path)

    new_content = build_sdk_csproj(
        output_type=output_type,
        target_framework=target_framework,
        root_namespace=root_namespace,
        assembly_name=assembly_name,
        use_wpf=wpf,
        gen_assembly_info=gen_assembly_info,
    )

    csproj_path.write_text(new_content, encoding="utf-8")
    return "converted"


def main():
    converted = []
    skipped_sdk = []
    skipped_path = []

    csproj_files = list(ROOT.rglob("*.csproj"))
    print(f"Found {len(csproj_files)} .csproj file(s) under {ROOT}\n")

    for path in sorted(csproj_files):
        result = convert_csproj(path)
        rel = path.relative_to(ROOT)
        if result == "converted":
            converted.append(rel)
        elif result == "skip_sdk":
            skipped_sdk.append(rel)
        elif result == "skip_path":
            skipped_path.append(rel)

    print("=== Converted ===")
    for p in converted:
        print(f"  [CONVERTED]  {p}")

    print("\n=== Skipped (already SDK-style or unrecognized) ===")
    for p in skipped_sdk:
        print(f"  [SKIP-SDK]   {p}")

    print("\n=== Skipped (bin/obj/Backup path) ===")
    for p in skipped_path:
        print(f"  [SKIP-PATH]  {p}")

    print(f"\n--- Summary ---")
    print(f"  Converted : {len(converted)}")
    print(f"  Skipped (SDK-style / unrecognized): {len(skipped_sdk)}")
    print(f"  Skipped (bin/obj/Backup path)     : {len(skipped_path)}")


if __name__ == "__main__":
    main()
