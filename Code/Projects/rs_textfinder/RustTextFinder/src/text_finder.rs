/////////////////////////////////////////////////////////////
// rust_textfinder::main.rs - recursive search for text    //
//                                                         //
// Jim Fawcett, https://JimFawcett.github.io, 05 May 2020  //
/////////////////////////////////////////////////////////////
/*
   TextFinder 
   - Recursive search for regular expression matches in
     files in a directory at a specified root path.
   - Options
       /P "..."       path to root of search
       /p "rs, txt"   file patterns to search
       /r "abc|BCD"   regular expression to match
       /s [true]      recursive search
       /H [true]      hide paths with no matches
       /v [true]      show options
*/
#![allow(unused_variables)]
#![allow(dead_code)]

/*-- TextFinder searches for text that matches a regex --*/
#[derive(Debug, Default)]
pub struct TextFinder {
    re_str : String,
    last_dir : String,
    // hide : bool,
    // recurse : bool,
}
impl TextFinder {
    pub fn new() -> TextFinder {
        Self { 
            re_str: String::default(), 
            last_dir: String::default(),
        }
    }
    pub fn regex(&mut self, s:&str) {
        self.re_str = s.to_string();
    }
    pub fn get_regex(&self) -> &str {
        &self.re_str
    }
    fn last_path(&mut self, p:&str) {
        self.last_dir = p.to_string();
    }
    fn get_last_path(&self) -> &str {
        &self.last_dir
    }
    pub fn find(&self, file_path: &str) -> bool {
        let contents:String;
        /*-- attempt to read file as text --*/
        let txt_rslt = std::fs::read_to_string(file_path);
        match txt_rslt {
            Ok(text) => contents = text,
            Err(_) => {
                /*-- attempt to read file as bytes --*/
                let bytes_rslt = std::fs::read(file_path);
                match bytes_rslt {
                    Ok(bytes) => {
                        /*-- convert bytes to lossy string --*/
                        contents = String::from_utf8_lossy(&bytes).to_string();
                    },
                    Err(_) => { return false; },
                }
            }
        }
        let rx_rslt = regex::Regex::new(&self.re_str);
        match rx_rslt {
            Ok(re) => re.is_match(&contents),
            Err(_) => false,
        }
    }
}

/*-- TfAppl is an application specific proxy for TextFinder --*/
#[derive(Debug, Default)]
pub struct TfAppl {
    tf: TextFinder,
    curr_dir: String,
    hide: bool,
    recurse: bool,
}
impl dir_nav_lib::DirEvent for TfAppl {
    fn do_dir(&mut self, d:&str) {
        /*-- save dir name for use in do_file --*/
        self.curr_dir = d.to_string();
        /*-- print directory name if H(ide) is false --*/
        if !self.get_hide() {
            print!("\n--{}", d);
        }
    }
    fn do_file(&mut self, f:&str) {
        /*-- build fully qualified path to file --*/
        let mut fqf = self.curr_dir.clone();
        fqf.push('/');
        fqf.push_str(f);
        /*-- look for file text that matches regex --*/
        if self.tf.find(&fqf) {
            /*-- print directory for first file if H(ide) is true --*/
            let pred = 
              self.tf.get_last_path() != self.curr_dir 
              && self.get_hide();
            if  pred {
                print!("\n\n  {}", self.curr_dir);
                self.tf.last_path(&self.curr_dir);
            }
            /*-- print name of file with matching text --*/
            print!("\n      {:?}", f);
        }
    }
}
impl TfAppl {
    pub fn new() -> Self {
        Self {
            tf: TextFinder::new(),
            curr_dir: String::default(),
            hide: true,
            recurse: true,
        }
    }
    pub fn recurse(&mut self, p:bool) {
        self.recurse = p;
    }
    pub fn get_recurse(&self) -> bool {
        self.recurse
    }
    pub fn hide(&mut self, p:bool) {
        self.hide =p;
    }
    pub fn get_hide(&self) -> bool {
        self.hide
    }
    pub fn regex(&mut self, s:&str) {
        self.tf.regex(s);
    }
    pub fn get_regex(&self) -> &str {
        self.tf.get_regex()
    }
}
/*-- Unit tests for white-box requirements --*/
#[cfg(test)]
mod tests {
    use super::*;

    /*-- REQ-TF-01: TextFinder::new() initial field values --*/
    #[test]
    fn tf_new_re_str_is_empty() {
        let tf = TextFinder::new();
        assert_eq!(tf.re_str, "");
    }
    #[test]
    fn tf_new_last_dir_is_empty() {
        let tf = TextFinder::new();
        assert_eq!(tf.last_dir, "");
    }

    /*-- REQ-TF-02: regex()/get_regex() round-trip --*/
    #[test]
    fn tf_regex_round_trip() {
        let mut tf = TextFinder::new();
        tf.regex("abc|def");
        assert_eq!(tf.get_regex(), "abc|def");
    }

    /*-- REQ-TF-06: last_path()/get_last_path() round-trip --*/
    #[test]
    fn tf_last_path_round_trip() {
        let mut tf = TextFinder::new();
        tf.last_path("some/dir");
        assert_eq!(tf.get_last_path(), "some/dir");
    }

    /*-- REQ-TA-01: TfAppl::new() initial field values --*/
    #[test]
    fn ta_new_hide_is_true() {
        let ta = TfAppl::new();
        assert!(ta.hide);
    }
    #[test]
    fn ta_new_recurse_is_true() {
        let ta = TfAppl::new();
        assert!(ta.recurse);
    }
    #[test]
    fn ta_new_curr_dir_is_empty() {
        let ta = TfAppl::new();
        assert_eq!(ta.curr_dir, "");
    }

    /*-- REQ-TA-04: hide()/get_hide() round-trip --*/
    #[test]
    fn ta_hide_round_trip() {
        let mut ta = TfAppl::new();
        ta.hide(false);
        assert!(!ta.get_hide());
        ta.hide(true);
        assert!(ta.get_hide());
    }

    /*-- REQ-TA-06: TfAppl::regex() delegates to embedded TextFinder --*/
    #[test]
    fn ta_regex_delegates_to_text_finder() {
        let mut ta = TfAppl::new();
        ta.regex("hello");
        assert_eq!(ta.get_regex(), "hello");
    }
}

/*-- display title, display options if v(erbose) is true --*/
fn verbose(parser: &cmd_line_lib::CmdLineParse) {
    const VERSION: &str = env!("CARGO_PKG_VERSION");
    print!("\n  TextFinder ver {}",VERSION);
    print!("\n =======================");
    if parser.options().contains_key(&'v') {
        print!("\n  path = {}", parser.abs_path());
        print!("\n  patterns = ");
        for patt in parser.patterns() {
            print!("{:?} ", patt);
        }
        print!("\n  regex = {:?}", parser.get_regex());
        for key in parser.options().keys() {
            let value_option = parser.options().get(&key);
            if let Some(value) = value_option {
                print!("\n  option: {} {:?}", key, value);
            }
        }
    }
    else {
        print!("\n  searching path: {:?}", &parser.abs_path());
        print!("\n  patterns: {:?}", parser.patterns());
        print!("\n  matching files with regex: {:?}", parser.get_regex());
    }
}
fn help() -> String {
    let mut help_str = String::new();
    const VERSION: &str = env!("CARGO_PKG_VERSION");
    help_str.push_str(&format!("\n  TextFinder ver {}",VERSION));
    help_str.push_str("\n =======================");
    help_str.push_str("\n  Help: [] => default values");
    help_str.push_str(&format!("\n  /P - start path           [{:?}]","."));
    help_str.push_str(&format!("\n  /p - patterns             {:?}","rs,exe,rlib"));
    help_str.push_str(&format!("\n  /s - recurse              [{:?}]","true"));
    help_str.push_str(&format!("\n  /H - hide unused dirs     [{:?}]","true"));
    help_str.push_str(&format!("\n  /r - regular expression   {:?}","abc"));
    help_str.push_str("\n  /v - display options");
    help_str.push_str("\n  /h - display this message");
    help_str
}
fn main() {
    let mut parser = cmd_line_lib::CmdLineParse::new();
    parser.default_options();
    parser.parse();

    if std::env::args().len() == 1 || parser.options().contains_key(&'h') {
        print!("\n{}\n", help());
        return;
    }

    let mut dn = dir_nav_lib::DirNav::<TfAppl>::new();

    if parser.options().contains_key(&'s') {
        let r_value = parser.options()[&'s'] == "true";
        dn.recurse(r_value);
        dn.get_app().recurse(r_value);
    }
    else {
        dn.recurse(false);
        dn.get_app().recurse(false);
    }

    if parser.options().contains_key(&'H') {
        let h_value = parser.options()[&'H']=="true";
        dn.hide(h_value);
        dn.get_app().hide(h_value);
    }
    else {
        dn.hide(true);
        dn.get_app().hide(true);
    }

    dn.get_app().regex(parser.get_regex());

    for patt in parser.patterns() {
        dn.add_pat(patt);
    }
    let mut p = std::path::PathBuf::new();
    p.push(parser.abs_path());

    verbose(&parser);
    let _ = dn.visit(&p);

    print!(
        "\n\n  processed {} files in {} dirs", 
        dn.get_files(), dn.get_dirs()
    );
    println!("\n\n  That's all Folks!\n\n");
}
