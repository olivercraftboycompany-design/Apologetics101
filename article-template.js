/* ==========================================================
   ARTICLE TEMPLATE
   ----------------------------------------------------------
   To make a new article:
     1. Copy this file and rename it (e.g. why-believe.js)
     2. Change the details and content below
     3. Add this line to index.html (between ARTICLES START/END):
          <script src="articles/why-believe.js" defer></script>
     4. Delete the line + file any time to remove an article.

   RULES
     - "slug" must be unique, lowercase, no spaces (use dashes).
     - "date" must look like  2026-10-02  (year-month-day).
     - Every block ends with a comma.
     - Use straight quotes "like this". If your text has a
       quote mark inside, use  \"  or wrap the text in 'single quotes'.

   FORMATTING INSIDE ANY TEXT
     **bold**    *italic*    [link text](https://example.com)

   BLOCKS YOU CAN USE (mix and repeat in any order)
     h2("Big heading")
     h3("Smaller heading")
     p("A paragraph.")
     scripture("Verse text.", "Book 1:1")
     quote("A quote.", "Who said it")
     objection("What the skeptic says.", "How you answer.")
     callout("Title", "A highlighted note.")
     bullets(["one", "two", "three"])
     numbered(["first", "second", "third"])
     image("images/photo.jpg", "describe the image", "optional caption")
     divider()
   ========================================================== */

registerArticle({

  // ----- Details -----
  slug:     "why-does-god-allow-suffering",   // unique, used in the link
  title:    "Why does God allow suffering?",
  summary:  "One of the hardest questions people ask. Here is a calm, honest way to think it through.",
  category: "Problem of evil",                // used for the filter buttons
  author:   "Your Name",
  date:     "2026-10-02",

  // ----- Your article, top to bottom -----
  content: [

    p("If God is good and all-powerful, why is there so much pain in the world? This is the question people bring up most often, and it deserves a **serious** answer, not a quick one."),

    h2("Start with the question being asked"),

    objection(
      "If God were really good and really powerful, He would stop suffering. Since suffering exists, God must not exist.",
      "This argument assumes God has no good reason to allow suffering. That's a big assumption. A good God could allow pain for reasons we can't always see, such as free will, growth, or a greater good that comes later."
    ),

    p("Notice what the objection actually claims. It isn't just that suffering is *hard*. It says suffering **proves** there is no God. To prove that, you would need to show that no good reason could ever exist, and that is very difficult to show."),

    h2("What Scripture says"),

    scripture(
      "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
      "Romans 8:28 (KJV)"
    ),

    p("This verse doesn't say every event is good. It says God works through events, even painful ones, toward something good."),

    callout(
      "Keep in mind",
      "Someone who is hurting may not need an argument first. Listen, then reason together when they're ready."
    ),

    h3("Three things worth remembering"),

    numbered([
      "**Free will is real.** Love can't be forced, and the freedom to love is also the freedom to harm.",
      "**Pain can have purpose.** Many people point to growth, compassion, and faith that came out of their hardest seasons.",
      "**God has entered suffering.** Christianity's center is a God who suffered, not one who watches from a distance."
    ]),

    quote(
      "Pain insists upon being attended to. God whispers to us in our pleasures, speaks in our conscience, but shouts in our pains.",
      "C. S. Lewis, The Problem of Pain"
    ),

    divider(),

    h2("Where to go next"),

    bullets([
      "Read the book of Job in one sitting",
      "Look at how the early church responded to plagues and persecution",
      "Write down the question you're still wrestling with"
    ]),

    p("Questions like this don't always get tidy answers. But an honest answer that admits its limits is better than a tidy one that isn't true.")

  ]
});
