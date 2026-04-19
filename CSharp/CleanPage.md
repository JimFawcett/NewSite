# Page Cleanup Instructions

## 1. Remove Unused Stylesheets and Scripts

Audit `<head>` for stylesheets and scripts whose elements, classes, or functions
do not appear anywhere in the page body. Remove any that are not used.

**Caution — scripts:** A script may provide behavior (not just styling) even when
none of its CSS classes or HTML elements appear in the page. Before removing a
script, read it to confirm it has no side effects on elements that *are* present.
For example, `link-nav.js` attaches a `LinkNavigator` to `#pages` and `#sections`
on `DOMContentLoaded`; it must be kept whenever those elements exist, regardless
of whether `#link-container` appears in the page.

## 2. Create a Page-Specific Stylesheet

Create `css/<PageName>Styles.css` in the `CSharp/css/` folder and add a link to
it in `<head>` after `ThemeCSharp.css`:

```html
<link rel="stylesheet" href="css/<PageName>Styles.css" />
```

Scope all rules with `#github` to match the site's CSS convention.

## 3. Move All Inline Styles to the New Stylesheet

For each element carrying a `style="..."` attribute:

1. Identify or add a class name that describes the element's role.
2. Add the corresponding rule to the new stylesheet.
3. Remove the `style="..."` attribute from the HTML.

**Caution — existing class names:** If an element already has a class, check
whether that class is styled by one of the global stylesheets (e.g. `Content.css`,
`ContentMenus.css`) before renaming it. Renaming a class that is already defined
globally will silently drop those inherited styles. Either keep the original class
name and add the new rule to the page stylesheet, or copy all global rules for
that class into the page stylesheet alongside any new ones.
