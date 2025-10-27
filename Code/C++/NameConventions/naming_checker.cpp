#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <regex>
#include <map>
#include <cctype>
#include <algorithm>

// Configuration for naming conventions
struct NamingConfig {
    enum class Style {
        SNAKE_CASE,
        CAMEL_CASE,
        PASCAL_CASE,
        SCREAMING_SNAKE_CASE,
        ANY
    };
    
    Style classStyle = Style::PASCAL_CASE;
    Style functionStyle = Style::SNAKE_CASE;
    Style variableStyle = Style::SNAKE_CASE;
    Style constantStyle = Style::SCREAMING_SNAKE_CASE;
    Style memberVarPrefix = Style::ANY;  // m_, _, none
    bool requireMemberPrefix = false;
    std::string memberPrefixPattern = "";  // e.g., "m_", "_"
};

// Violation record
struct Violation {
    int lineNumber;
    std::string violationType;
    std::string identifier;
    std::string expectedStyle;
    std::string actualStyle;
};

class NamingChecker {
private:
    NamingConfig config;
    std::vector<Violation> violations;
    
    // Style checking functions
    bool isSnakeCase(const std::string& name) {
        if (name.empty()) return false;
        std::regex pattern("^[a-z][a-z0-9_]*$");
        return std::regex_match(name, pattern);
    }
    
    bool isCamelCase(const std::string& name) {
        if (name.empty()) return false;
        std::regex pattern("^[a-z][a-zA-Z0-9]*$");
        return std::regex_match(name, pattern) && 
               std::any_of(name.begin(), name.end(), ::isupper);
    }
    
    bool isPascalCase(const std::string& name) {
        if (name.empty()) return false;
        std::regex pattern("^[A-Z][a-zA-Z0-9]*$");
        return std::regex_match(name, pattern);
    }
    
    bool isScreamingSnakeCase(const std::string& name) {
        if (name.empty()) return false;
        std::regex pattern("^[A-Z][A-Z0-9_]*$");
        return std::regex_match(name, pattern);
    }
    
    std::string getStyleName(NamingConfig::Style style) {
        switch(style) {
            case NamingConfig::Style::SNAKE_CASE: return "snake_case";
            case NamingConfig::Style::CAMEL_CASE: return "camelCase";
            case NamingConfig::Style::PASCAL_CASE: return "PascalCase";
            case NamingConfig::Style::SCREAMING_SNAKE_CASE: return "SCREAMING_SNAKE_CASE";
            default: return "any";
        }
    }
    
    bool matchesStyle(const std::string& name, NamingConfig::Style style) {
        switch(style) {
            case NamingConfig::Style::SNAKE_CASE:
                return isSnakeCase(name);
            case NamingConfig::Style::CAMEL_CASE:
                return isCamelCase(name);
            case NamingConfig::Style::PASCAL_CASE:
                return isPascalCase(name);
            case NamingConfig::Style::SCREAMING_SNAKE_CASE:
                return isScreamingSnakeCase(name);
            case NamingConfig::Style::ANY:
                return true;
            default:
                return false;
        }
    }
    
    std::string detectStyle(const std::string& name) {
        if (isScreamingSnakeCase(name)) return "SCREAMING_SNAKE_CASE";
        if (isPascalCase(name)) return "PascalCase";
        if (isCamelCase(name)) return "camelCase";
        if (isSnakeCase(name)) return "snake_case";
        return "unknown/mixed";
    }
    
    void addViolation(int lineNum, const std::string& type, 
                     const std::string& identifier, 
                     const std::string& expected) {
        Violation v;
        v.lineNumber = lineNum;
        v.violationType = type;
        v.identifier = identifier;
        v.expectedStyle = expected;
        v.actualStyle = detectStyle(identifier);
        violations.push_back(v);
    }
    
    // Extract identifiers from various C++ constructs
    void checkClass(const std::string& line, int lineNum) {
        std::regex classPattern(R"(\b(?:class|struct)\s+([A-Za-z_][A-Za-z0-9_]*))");
        std::smatch match;
        std::string searchLine = line;
        
        while (std::regex_search(searchLine, match, classPattern)) {
            std::string className = match[1].str();
            if (!matchesStyle(className, config.classStyle)) {
                addViolation(lineNum, "Class", className, 
                           getStyleName(config.classStyle));
            }
            searchLine = match.suffix();
        }
    }
    
    void checkFunction(const std::string& line, int lineNum) {
        // Simple function pattern (not perfect but catches many cases)
        std::regex funcPattern(R"(\b([A-Za-z_][A-Za-z0-9_]*)\s*\([^)]*\)\s*(?:const)?\s*\{?)");
        std::smatch match;
        
        // Skip constructors, operators, and common keywords
        std::vector<std::string> skipKeywords = {
            "if", "while", "for", "switch", "catch", "sizeof", "return"
        };
        
        if (std::regex_search(line, match, funcPattern)) {
            std::string funcName = match[1].str();
            
            // Skip if it's a keyword or looks like a constructor
            bool skip = false;
            for (const auto& keyword : skipKeywords) {
                if (funcName == keyword) {
                    skip = true;
                    break;
                }
            }
            
            // Skip if first letter is uppercase (likely constructor)
            if (!skip && !funcName.empty() && std::isupper(funcName[0]) && 
                line.find("class") == std::string::npos) {
                // Might be constructor, but check function style anyway
            }
            
            if (!skip && !matchesStyle(funcName, config.functionStyle)) {
                addViolation(lineNum, "Function", funcName, 
                           getStyleName(config.functionStyle));
            }
        }
    }
    
    void checkVariable(const std::string& line, int lineNum) {
        // Pattern for variable declarations (simplified)
        std::regex varPattern(R"(\b(?:int|float|double|char|bool|auto|string|std::string|size_t|uint32_t|int64_t)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*[=;,)])");
        std::smatch match;
        std::string searchLine = line;
        
        while (std::regex_search(searchLine, match, varPattern)) {
            std::string varName = match[1].str();
            if (!matchesStyle(varName, config.variableStyle)) {
                addViolation(lineNum, "Variable", varName, 
                           getStyleName(config.variableStyle));
            }
            searchLine = match.suffix();
        }
    }
    
    void checkConstant(const std::string& line, int lineNum) {
        std::regex constPattern(R"(\bconst\s+\w+\s+([A-Za-z_][A-Za-z0-9_]*)\s*=)");
        std::regex constexprPattern(R"(\bconstexpr\s+\w+\s+([A-Za-z_][A-Za-z0-9_]*)\s*=)");
        std::smatch match;
        
        if (std::regex_search(line, match, constPattern) ||
            std::regex_search(line, match, constexprPattern)) {
            std::string constName = match[1].str();
            if (!matchesStyle(constName, config.constantStyle)) {
                addViolation(lineNum, "Constant", constName, 
                           getStyleName(config.constantStyle));
            }
        }
    }
    
    void checkMemberVariable(const std::string& line, int lineNum, bool inClass) {
        if (!inClass || !config.requireMemberPrefix) return;
        
        // Check for member variable declarations
        std::regex memberPattern(R"(\b(?:int|float|double|char|bool|auto|string|std::string|size_t)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*;)");
        std::smatch match;
        
        if (std::regex_search(line, match, memberPattern)) {
            std::string memberName = match[1].str();
            if (!config.memberPrefixPattern.empty() &&
                memberName.find(config.memberPrefixPattern) != 0) {
                addViolation(lineNum, "Member Variable", memberName, 
                           "prefix with " + config.memberPrefixPattern);
            }
        }
    }
    
public:
    NamingChecker(const NamingConfig& cfg) : config(cfg) {}
    
    void checkFile(const std::string& filename) {
        std::ifstream file(filename);
        if (!file.is_open()) {
            std::cerr << "Error: Could not open file " << filename << std::endl;
            return;
        }
        
        std::string line;
        int lineNum = 0;
        bool inClass = false;
        int braceDepth = 0;
        
        while (std::getline(file, line)) {
            lineNum++;
            
            // Skip comments and empty lines
            if (line.empty() || line.find("//") == 0) continue;
            
            // Track if we're inside a class
            if (line.find("class ") != std::string::npos || 
                line.find("struct ") != std::string::npos) {
                inClass = true;
                braceDepth = 0;
            }
            
            // Track braces to know when class ends
            for (char c : line) {
                if (c == '{') braceDepth++;
                if (c == '}') braceDepth--;
            }
            if (inClass && braceDepth == 0 && line.find('}') != std::string::npos) {
                inClass = false;
            }
            
            // Check different constructs
            checkClass(line, lineNum);
            checkFunction(line, lineNum);
            checkVariable(line, lineNum);
            checkConstant(line, lineNum);
            checkMemberVariable(line, lineNum, inClass);
        }
        
        file.close();
    }
    
    void printReport() {
        if (violations.empty()) {
            std::cout << "✓ No naming convention violations found!" << std::endl;
            return;
        }
        
        std::cout << "\n=== Naming Convention Violations ===" << std::endl;
        std::cout << "Total violations: " << violations.size() << "\n" << std::endl;
        
        // Group by type
        std::map<std::string, std::vector<Violation>> grouped;
        for (const auto& v : violations) {
            grouped[v.violationType].push_back(v);
        }
        
        for (const auto& [type, viols] : grouped) {
            std::cout << type << " violations (" << viols.size() << "):" << std::endl;
            for (const auto& v : viols) {
                std::cout << "  Line " << v.lineNumber << ": '" << v.identifier 
                         << "' - Expected: " << v.expectedStyle 
                         << ", Found: " << v.actualStyle << std::endl;
            }
            std::cout << std::endl;
        }
    }
    
    int getViolationCount() const {
        return violations.size();
    }
    
    void setConfig(const NamingConfig& cfg) {
        config = cfg;
        violations.clear();
    }
};

void printUsage(const char* programName) {
    std::cout << "Usage: " << programName << " [options] <file.cpp>" << std::endl;
    std::cout << "\nOptions:" << std::endl;
    std::cout << "  --class-style <style>      Class naming style (default: PascalCase)" << std::endl;
    std::cout << "  --function-style <style>   Function naming style (default: snake_case)" << std::endl;
    std::cout << "  --variable-style <style>   Variable naming style (default: snake_case)" << std::endl;
    std::cout << "  --constant-style <style>   Constant naming style (default: SCREAMING_SNAKE_CASE)" << std::endl;
    std::cout << "  --member-prefix <prefix>   Required member variable prefix (e.g., m_, _)" << std::endl;
    std::cout << "\nStyle options: snake_case, camelCase, PascalCase, SCREAMING_SNAKE_CASE" << std::endl;
    std::cout << "\nExamples:" << std::endl;
    std::cout << "  " << programName << " mycode.cpp" << std::endl;
    std::cout << "  " << programName << " --class-style PascalCase --function-style camelCase mycode.cpp" << std::endl;
    std::cout << "  " << programName << " --member-prefix m_ mycode.cpp" << std::endl;
}

NamingConfig::Style parseStyle(const std::string& style) {
    if (style == "snake_case") return NamingConfig::Style::SNAKE_CASE;
    if (style == "camelCase") return NamingConfig::Style::CAMEL_CASE;
    if (style == "PascalCase") return NamingConfig::Style::PASCAL_CASE;
    if (style == "SCREAMING_SNAKE_CASE") return NamingConfig::Style::SCREAMING_SNAKE_CASE;
    return NamingConfig::Style::ANY;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        printUsage(argv[0]);
        return 1;
    }
    
    NamingConfig config;
    std::string filename;
    
    // Parse command line arguments
    for (int i = 1; i < argc; i++) {
        std::string arg = argv[i];
        
        if (arg == "--help" || arg == "-h") {
            printUsage(argv[0]);
            return 0;
        } else if (arg == "--class-style" && i + 1 < argc) {
            config.classStyle = parseStyle(argv[++i]);
        } else if (arg == "--function-style" && i + 1 < argc) {
            config.functionStyle = parseStyle(argv[++i]);
        } else if (arg == "--variable-style" && i + 1 < argc) {
            config.variableStyle = parseStyle(argv[++i]);
        } else if (arg == "--constant-style" && i + 1 < argc) {
            config.constantStyle = parseStyle(argv[++i]);
        } else if (arg == "--member-prefix" && i + 1 < argc) {
            config.memberPrefixPattern = argv[++i];
            config.requireMemberPrefix = true;
        } else if (arg[0] != '-') {
            filename = arg;
        } else {
            std::cerr << "Unknown option: " << arg << std::endl;
            return 1;
        }
    }
    
    if (filename.empty()) {
        std::cerr << "Error: No input file specified" << std::endl;
        printUsage(argv[0]);
        return 1;
    }
    
    std::cout << "Checking naming conventions for: " << filename << std::endl;
    std::cout << "Configuration:" << std::endl;
    std::cout << "  Classes: " << (config.classStyle == NamingConfig::Style::PASCAL_CASE ? "PascalCase" : "other") << std::endl;
    std::cout << "  Functions: " << (config.functionStyle == NamingConfig::Style::SNAKE_CASE ? "snake_case" : "other") << std::endl;
    std::cout << "  Variables: " << (config.variableStyle == NamingConfig::Style::SNAKE_CASE ? "snake_case" : "other") << std::endl;
    std::cout << "  Constants: " << (config.constantStyle == NamingConfig::Style::SCREAMING_SNAKE_CASE ? "SCREAMING_SNAKE_CASE" : "other") << std::endl;
    if (config.requireMemberPrefix) {
        std::cout << "  Member prefix: " << config.memberPrefixPattern << std::endl;
    }
    std::cout << std::endl;
    
    NamingChecker checker(config);
    checker.checkFile(filename);
    checker.printReport();
    
    return checker.getViolationCount() > 0 ? 1 : 0;
}