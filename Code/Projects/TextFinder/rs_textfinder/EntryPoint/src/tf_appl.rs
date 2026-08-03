/////////////////////////////////////////////////////////////
// tf_appl.rs - DirEvent implementor for TextFinder        //
//                                                         //
// Jim Fawcett, https://JimFawcett.github.io               //
/////////////////////////////////////////////////////////////

use crate::TextFinder;

/*-- TfAppl is an application specific proxy for TextFinder --*/
#[derive(Debug, Default)]
pub struct TfAppl {
    tf: TextFinder,
    curr_dir: String,
    hide: bool,
    recurse: bool,
    match_count: usize,
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
            self.match_count += 1;
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
            match_count: 0,
        }
    }
    pub fn get_match_count(&self) -> usize {
        self.match_count
    }
    pub fn recurse(&mut self, p:bool) {
        self.recurse = p;
    }
    pub fn get_recurse(&self) -> bool {
        self.recurse
    }
    pub fn hide(&mut self, p:bool) {
        self.hide = p;
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

/*-- Unit tests for TfAppl white-box requirements --*/
#[cfg(test)]
mod tests {
    use super::*;

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
