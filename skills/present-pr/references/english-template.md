# English Chat Output Contract — `present-pr`

Local-only operator template. Never published — the sync strips the pointer block
in `SKILL.md` and never copies this file.

```markdown
# 🎨 Visual Showcase & Story: [#<id> - <title>](<url-issue>)

## 💡 The Story of the Change:
- **The Problem Before:** [One plain sentence: what was frustrating, missing, or broken for the user]
- **What Changed:** [Plain explanation of what was built or improved across the run]
- **The New Experience:** [What is visible, fast, and working now]

## 🖥️ Interactive Presentation & Mockup:
Choose how you'd like to open and explore the interactive showcase:

- **🔗 IDE / In-App Preview:** [Open in Preview Window](file:///<absolute-path-to-html>)
- **🌐 Localhost Server:** `http://localhost:<port>/<relative-path-to-html>` *(if serving: `npx serve .` or `python -m http.server <port>`)*
- **📂 Open in Browser:** `cmd /c start "" "<absolute-native-path-to-html>"`
- **📁 Reveal in Folder:** `explorer /select,"<absolute-native-path-to-html>"`
- **📋 Full File Path:** `<absolute-native-path-to-html>`

*(Shipped in PR [#<n>](<url-pr>) for Issue [#<id>](<url-issue>))*

## 👁️ Try It in the Live App:
1. **Navigate to:** [Screen name / Tab / URL]
2. **Action:** [One simple action in plain words]
3. **Outcome:** [What you will see and experience]

---

## ➡️ Next Step:
- Showcase ready for review. Run **`/i-pick-issue`** to start on the next task.
```
