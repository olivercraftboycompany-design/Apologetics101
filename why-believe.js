registerArticle({

  // ----- Details -----
  slug:     "Question truely what you believe in.",   // unique, used in the link
  title:    "Questioning your faith?",
  summary:  "Why do I believe my faith and what is the evidence that supports my faith.",
  category: "Faith",                // used for the filter buttons
  author:   "Oliver Holder",
  date:     "2026-10-2",


  content: [

    p("Is my faith true or not? Well ask yourself is it? "),

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
