# label-placement

A feature showcase (not a diagram type) demonstrating the `<arrow>` label-placement attributes `label-anchor` and `label-pos`. There is no Mermaid equivalent, so this case has no `ref.mmd` and this file is the only oracle.

Each connector is a plain `A → B` arrow; the label text names the attribute value it is rendered with, so the position of the text shows the effect.

## label-anchor on a horizontal connector (top group)

Three stacked horizontal arrows, each labelled with its `label-anchor` value:

- **top** — the label sits **above** the line.
- **center** — the label sits **on** the line (the white label background masks the stroke behind the text).
- **bottom** — the label sits **below** the line.

## label-anchor on a vertical connector (middle group)

Three vertical arrows (A above, B below) side by side, each labelled with its `label-anchor` value:

- **left** — the label sits **left of** the line.
- **center** — the label sits **on** the line.
- **right** — the label sits **right of** the line.

## label-pos along a connector (bottom group)

One horizontal arrow carrying **three** labels at different `label-pos` values, left to right: **tail** (near the `from`/A end), **center** (the midpoint, the default), **head** (near the `to`/B end). The three labels do not overlap.

Every label is legible, placed as described relative to its connector, and no label is clipped at the image edge.
