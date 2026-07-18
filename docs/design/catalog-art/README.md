# Catalog art pipeline (ChatGPT collages → slice → GIF)

## Why

Agent one-off generations caused:

- style drift (photo covers vs vector exercises)
- GIF frame jumps (character “slides” between frames)

We lock style in `STYLE_BIBLE.md` and generate **collages** in ChatGPT (your account) for consistency, then slice deterministically.

## Workflow

1. Open [ChatGPT](https://chatgpt.com) (you log in).
2. Paste prompts from `PROMPT_EXERCISES.md` then `PROMPT_COVERS.md` **one sheet at a time** (order **M1→M2→M3→E1→E4→C1→C2**).
3. Every prompt has **exact canvas px** and **1008×567 (16:9) cells**. Reject square outputs.
4. Download each collage PNG into:

```text
.temp/catalog-art/input/M1.png … M3.png   # multi-frame motion (4 frames/row)
.temp/catalog-art/input/E1.png … E4.png   # static stills
.temp/catalog-art/input/C1.png C2.png     # covers (same style, not photos)
```

5. Tell agent «M1 done» / «E2 done» — gutter-aware slice → GIF (multi-frame) / webp.

Optional local tools:

```bash
node scripts/slice-catalog-art.mjs --all
```

5. Spot-check GIF pairs (A/B alignment). Re-roll only the bad **sheet**.
6. Update D1 media keys if extensions change (gif vs webp):

```bash
# example
cd apps/web && npx wrangler d1 execute flowly-db --local --command="UPDATE exercises SET media_object_key='catalog/exercises/'||id||'.gif', media_type='gif' WHERE id IN (...);"
```

7. Commit under `apps/web/public/media/catalog/**`.

## Outputs

| Path | Content |
|------|---------|
| `apps/web/public/media/catalog/exercises/*.webp` | Static poses |
| `apps/web/public/media/catalog/exercises/*.gif` | 2-frame motion |
| `apps/web/public/media/catalog/covers/*.webp` | Flowly workout heroes |

## Files

| File | Role |
|------|------|
| `STYLE_BIBLE.md` | Immutable visual contract |
| `PROMPT_EXERCISES.md` | Ready-to-paste exercise collages |
| `PROMPT_COVERS.md` | Ready-to-paste cover collages |
| `scripts/slice-catalog-art.mjs` | Grid slice + GIF assembly |

## Note on determinism

True pixel-identical regeneration is not guaranteed by ChatGPT. Maximizing sameness:

- always paste full style lock
- never mix models mid-set
- keep sheet prompts fixed in git (this folder)
- regenerate whole sheet if one cell fails
