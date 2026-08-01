# Fix defn styles

Locate the existing `#github defn-code`, `#github defn-head`, `#github defn-block`, and `#github defn-body` rule blocks in the page's `<style>` section and replace each with the corresponding block below. Match by selector name — overwrite the entire rule body so declarations, property order, and values are exactly as shown. Do not add new rules if a selector is missing; only replace what is already present.

Also locate the existing `#github details defn-block`, `#github details defn-code`, `#github details defn-head`, and `#github details defn-body` rule blocks and replace each with the corresponding block shown below the top set. Same matching rule — overwrite existing rule bodies only; do not add missing selectors.

For the `#github pre, #github pre code` rule below: if a matching rule already exists in the page's `<style>` section, replace its body with the block shown. If no matching rule exists, add the block as-is to the `<style>` section.

For the `#github codewrap` rule below: if a matching rule already exists in the page's `<style>` section, replace its body with the block shown. If no matching rule exists, add the block as-is to the `<style>` section.

    #github defn-code {
      background-color: var(--light);
      color: var(--dark);
      border-radius: 4px;
      width: max-content;
      padding: 0rem 2rem;
    }

    #github defn-head {
      background-color: var(--dark);
      color: var(--light);
    }

    #github defn-block {
      background-color: var(--light);
      color: var(--dark);
    }

    #github defn-body {
      color: var(--dark);
    }  </style>
    
    #github details defn-block {
      background-color: var(--light);
      color: var(--dark);
    }
    
    #github details defn-code {
      background-color: var(--light);
      color: var(--dark);
    }
    
    #github details defn-head {
      background-color: var(--dark);
      color: var(--light);
    }
    
    #github details defn-body {
      color: var(--dark);
    }

    #github pre,
    #github pre code {
      background-color: var(--dark);
      color: var(--light);
      font-size:0.9rem;
    }

    #github .codewrap {
      background-color: var(--dark);
      padding:0rem;
    }
