/* ==========================================================
   Apologetics 101 — Objections & Answers library + quiz
   Add a new answer by copying one block in ANSWERS.
   "verses" must be keys that exist in kjv.js (verified KJV).
   ========================================================== */

window.ANSWERS = [
  {
    id: "problem-of-evil",
    icon: "ph-cloud-lightning",
    topic: "God & Suffering",
    q: "If God is good and all-powerful, why is there evil and suffering?",
    short: "The logical version of this argument says God and evil can't both exist. Most philosophers today, including many atheists, agree that version fails: a good God could have morally sufficient reasons to allow evil, like real free will. The harder version asks whether all the suffering we see is *likely*, and Christianity's answer there is a God who entered suffering Himself and promises to end it.",
    points: [
      "**Free will defense:** a world with free creatures who can truly love is also a world where they can truly harm. Philosopher Alvin Plantinga argued this shows God and evil are not logically contradictory.",
      "**We don't see the whole picture:** not knowing God's reason for something doesn't prove there isn't one.",
      "**The cross:** Christianity doesn't explain suffering from a distance. Its center is God suffering with and for us.",
      "**The ending matters:** the Bible promises evil won't get the last word."
    ],
    honest: "This is the hardest objection, and it's okay to say so. Someone who is hurting usually needs comfort before arguments.",
    verses: ["Romans 8:18", "Revelation 21:4", "Romans 8:28"],
    sources: [
      "Alvin Plantinga, *God, Freedom, and Evil* (1974)",
      "C. S. Lewis, *The Problem of Pain* (1940)",
      "William Rowe, \"The Problem of Evil and Some Varieties of Atheism\" (1979), the strongest skeptic version"
    ]
  },
  {
    id: "bible-reliable",
    icon: "ph-scroll",
    topic: "The Bible",
    q: "Hasn't the Bible been changed so many times we can't trust it?",
    short: "No ancient book is better preserved. There are over 5,000 Greek manuscripts of the New Testament, some within about 100 to 200 years of the originals, so scholars can compare them and rebuild the original text with high confidence. The Dead Sea Scrolls (found in 1947) include an Isaiah scroll roughly 1,000 years older than the oldest Hebrew copies we had before, and it reads almost the same.",
    points: [
      "**Lots of copies:** most ancient works survive in a handful of copies made centuries later. The New Testament has thousands.",
      "**Variants are mostly tiny:** spelling, word order, and copying slips. Even skeptical scholar Bart Ehrman agrees no core Christian belief depends on a disputed passage.",
      "**\"Telephone game\" isn't how it worked:** copies branched out in many places at once, so mistakes in one line can be caught by comparing others.",
      "**Transmission vs. truth:** reliable copying shows we have what was written. Whether it's *true* is the next question (see the resurrection)."
    ],
    honest: "There are a few passages scholars think were added later, like the end of Mark 16 and John 7:53 to 8:11. Your Bible's footnotes usually say so openly.",
    verses: ["2 Timothy 3:16", "2 Peter 1:16", "Isaiah 40:8"],
    sources: [
      "Bruce Metzger & Bart Ehrman, *The Text of the New Testament* (4th ed., 2005)",
      "F. F. Bruce, *The New Testament Documents: Are They Reliable?* (1943)",
      "Bart Ehrman, *Misquoting Jesus* (2005), a skeptic's view worth knowing"
    ]
  },
  {
    id: "resurrection",
    icon: "ph-sun-horizon",
    topic: "Jesus",
    q: "Did Jesus really rise from the dead?",
    short: "Christianity stands or falls here, and Paul says so himself. Most historians, Christian or not, accept a few core facts: Jesus died by crucifixion, his followers sincerely believed they saw him alive again, and skeptics like Paul and Jesus' brother James changed their minds. The creed in 1 Corinthians 15 is dated by many scholars to within a few years of the crucifixion. The resurrection is the explanation that fits all of those facts.",
    points: [
      "**Early testimony:** 1 Corinthians 15:3-7 is a creed Paul \"received\" and passed on, naming witnesses who were still alive to be questioned.",
      "**Changed lives:** the disciples went from hiding to dying for this claim. People die for lies they believe, but not for ones they know they made up.",
      "**Hostile witnesses:** Paul persecuted Christians, and James doubted his brother. Both became leaders after saying they saw Jesus risen.",
      "**Alternatives struggle:** hallucinations don't usually happen to groups, and a stolen body doesn't explain the appearances."
    ],
    honest: "Historians can show what the evidence points to, but a miracle is still a big claim. The question is whether you rule miracles out before looking.",
    verses: ["1 Corinthians 15:3-6", "1 Corinthians 15:14", "Acts 1:3"],
    sources: [
      "Gary Habermas & Michael Licona, *The Case for the Resurrection of Jesus* (2004)",
      "N. T. Wright, *The Resurrection of the Son of God* (2003)"
    ]
  },
  {
    id: "jesus-existed",
    icon: "ph-user-focus",
    topic: "Jesus",
    q: "Did Jesus even exist?",
    short: "Yes, and almost every historian agrees, including atheists. Outside the Bible, the Roman historian Tacitus (about AD 116) writes that Christ was executed under Pontius Pilate, and the Jewish historian Josephus mentions Jesus twice. Skeptical scholar Bart Ehrman wrote a whole book defending that Jesus was a real person.",
    points: [
      "**Tacitus,** *Annals* 15.44: Christ \"suffered the extreme penalty\" under Pilate during the reign of Tiberius.",
      "**Josephus,** *Antiquities* 20.9.1: mentions \"the brother of Jesus, who was called Christ, whose name was James.\"",
      "**Paul's letters** were written within about two decades of Jesus' death, and he met Jesus' brother James and the apostle Peter.",
      "Whether Jesus *existed* is settled history. Who he *was* is the real debate."
    ],
    honest: "One Josephus passage (*Antiquities* 18.3.3) was likely edited by later Christian copyists, but most scholars think an original mention of Jesus sits underneath it.",
    verses: ["Luke 1:1-4", "John 20:30-31"],
    sources: [
      "Bart Ehrman, *Did Jesus Exist?* (2012)",
      "Tacitus, *Annals* 15.44; Josephus, *Antiquities* 18.3.3 and 20.9.1"
    ]
  },
  {
    id: "science-faith",
    icon: "ph-atom",
    topic: "Science",
    q: "Hasn't science disproved God?",
    short: "Science explains *how* nature works. It can't tell you *why* there's a nature at all, or why it follows laws we can understand. Many founders of modern science, like Kepler and Newton, believed in God, and the Big Bang theory was first proposed by Georges Lemaître, a Catholic priest. Today scientists like Francis Collins, who led the Human Genome Project, are Christians.",
    points: [
      "**A beginning:** the evidence that the universe had a beginning fits the claim that something outside it caused it.",
      "**Fine-tuning:** physicists note that several constants of nature fall in narrow ranges that allow life (see Martin Rees, *Just Six Numbers*).",
      "**Science needs faith-like assumptions:** that nature is orderly and our minds can understand it.",
      "**God of the gaps?** The strongest arguments aren't about what science *can't* explain yet, but about what it shows."
    ],
    honest: "Christians disagree with each other on things like the age of the earth and evolution. You don't have to settle every science debate to trust Jesus.",
    verses: ["Psalm 19:1", "Romans 1:20", "Genesis 1:1"],
    sources: [
      "Francis Collins, *The Language of God* (2006)",
      "Martin Rees, *Just Six Numbers* (1999)",
      "John Lennox, *God's Undertaker: Has Science Buried God?* (2007)"
    ]
  },
  {
    id: "other-religions",
    icon: "ph-globe-hemisphere-west",
    topic: "Religions",
    q: "Aren't all religions basically the same?",
    short: "They share some good morals, but they make claims that can't all be true. For example, Christianity says Jesus died on the cross and rose again, while Islam's Quran (4:157) says he wasn't crucified. Buddhism doesn't center on a personal creator God at all. Saying they're all the same actually disrespects what each one teaches.",
    points: [
      "**Different answers:** to \"who is God,\" \"what's wrong with us,\" and \"how are we saved,\" religions give different answers.",
      "**Grace is unusual:** most systems say you earn your way up. Christianity says God came down and saved us as a gift.",
      "**Jesus' claim was exclusive:** he didn't present himself as one path among many.",
      "**Respect people, test claims:** you can be kind to people of every faith and still say not every claim is true."
    ],
    honest: "Christians should learn what others actually believe from their own sources, not from caricatures.",
    verses: ["John 14:6", "Acts 4:12", "Ephesians 2:8-9"],
    sources: [
      "Stephen Prothero, *God Is Not One* (2010)",
      "Timothy Keller, *The Reason for God* (2008), chapter 1"
    ]
  },
  {
    id: "morality",
    icon: "ph-scales",
    topic: "Morality",
    q: "Can't we be good without God?",
    short: "Yes, atheists can be good people, and the Bible says so too: the law is \"written in their hearts.\" The real question is whether anything is *truly* right or wrong without God. If morality is just evolution or opinion, then \"murder is evil\" is only a preference. Most of us know some things are wrong no matter what anyone thinks, and that points to a moral lawgiver.",
    points: [
      "**Knowing vs. grounding:** anyone can *know* right from wrong. The question is what makes it *really* right or wrong.",
      "**The moral argument:** if objective moral values exist, God is the best explanation for them.",
      "**Euthyphro:** \"Is good good because God commands it?\" Christians answer that goodness flows from God's own nature, not random commands."
    ],
    honest: "Some philosophers defend objective morality without God. It's a live debate, so learn their best arguments too.",
    verses: ["Romans 2:14-15", "Micah 6:8"],
    sources: [
      "C. S. Lewis, *Mere Christianity* (1952), Book 1",
      "William Lane Craig, *Reasonable Faith* (3rd ed., 2008)"
    ]
  },
  {
    id: "who-made-god",
    icon: "ph-infinity",
    topic: "God",
    q: "If everything needs a cause, who made God?",
    short: "The argument isn't \"everything needs a cause.\" It's \"everything that *begins to exist* has a cause.\" The universe began to exist, so it needs a cause outside space and time. God, by definition, never began. Asking who made God is like asking who the bachelor's wife is.",
    points: [
      "**The Kalam argument:** (1) Whatever begins to exist has a cause. (2) The universe began to exist. (3) So the universe has a cause.",
      "**What the cause must be like:** outside time and space, enormously powerful, and able to choose to create.",
      "**No infinite chain:** something has to exist without being caused, or nothing would exist."
    ],
    honest: "The argument points to a creator, but on its own it doesn't prove that creator is the God of the Bible. That's where Jesus and the resurrection come in.",
    verses: ["Psalm 90:2", "John 1:1", "Colossians 1:17"],
    sources: [
      "William Lane Craig, *The Kalam Cosmological Argument* (1979)",
      "Edward Feser, *Five Proofs of the Existence of God* (2017)"
    ]
  },
  {
    id: "contradictions",
    icon: "ph-git-diff",
    topic: "The Bible",
    q: "Don't the Gospels contradict each other?",
    short: "The Gospels tell the same story from four angles, with different details, which is exactly what we expect from independent accounts. If all four matched word for word, people would say they copied each other. Most \"contradictions\" are differences in focus or wording: one writer mentions two angels at the tomb, another mentions the one who spoke.",
    points: [
      "**Different audiences:** Matthew writes with Jewish readers in mind, Luke for a Greek reader named Theophilus.",
      "**Ancient biographies** often arranged events by theme, not strict order.",
      "**Core agreement:** all four agree on Jesus' teaching, miracles, death under Pilate, the empty tomb, and the appearances."
    ],
    honest: "A few differences are hard to harmonize, and Christians handle them in different ways. Look them up and wrestle honestly.",
    verses: ["Luke 1:1-4", "John 20:30-31"],
    sources: [
      "Richard Bauckham, *Jesus and the Eyewitnesses* (2006)",
      "Craig Blomberg, *The Historical Reliability of the Gospels* (2nd ed., 2007)"
    ]
  },
  {
    id: "hell",
    icon: "ph-door-open",
    topic: "God",
    q: "How could a loving God send people to hell?",
    short: "The Bible says God doesn't want anyone to perish and sent Jesus to save, not condemn. Hell is, at its core, being separated from God, and C. S. Lewis argued that people in hell are there because they keep choosing themselves over God. A loving God respects that choice instead of forcing anyone into His presence.",
    points: [
      "**God's desire:** \"not willing that any should perish.\"",
      "**Justice matters:** a God who ignored evil forever wouldn't be loving to its victims.",
      "**Lewis:** \"the doors of hell are locked on the *inside*.\""
    ],
    honest: "Christians have held different views on what hell is like. The Bible's images (fire, darkness) are serious, and humility helps here.",
    verses: ["2 Peter 3:9", "John 3:16-17"],
    sources: [
      "C. S. Lewis, *The Problem of Pain* (1940), ch. 8, and *The Great Divorce* (1945)",
      "Timothy Keller, *The Reason for God* (2008), ch. 5"
    ]
  }
];

/* ---------- Test yourself: add questions the same way ---------- */
window.QUIZ = [
  { q: "The word \"apologetics\" comes from the Greek word *apologia*. What does it mean?",
    options: ["Saying sorry", "A defense or reasoned answer", "A sermon", "A prayer"], answer: 1,
    why: "In 1 Peter 3:15 the KJV's \"give an answer\" translates *apologia*, a defense." },
  { q: "Which verse tells Christians to \"be ready always to give an answer\" for their hope?",
    options: ["John 3:16", "Romans 8:28", "1 Peter 3:15", "Psalm 23:1"], answer: 2,
    why: "1 Peter 3:15, and it adds \"with meekness and fear.\" Gentleness is part of the job." },
  { q: "Which Roman historian wrote that Christ was executed under Pontius Pilate?",
    options: ["Tacitus", "Julius Caesar", "Homer", "Plato"], answer: 0,
    why: "Tacitus, *Annals* 15.44, written around AD 116." },
  { q: "The Big Bang theory was first proposed by Georges Lemaître. What else was he?",
    options: ["An atheist activist", "A Catholic priest", "A Greek philosopher", "A medieval monk"], answer: 1,
    why: "Lemaître was a Belgian Catholic priest and physicist." },
  { q: "When were the Dead Sea Scrolls discovered?",
    options: ["1611", "1847", "1947", "1999"], answer: 2,
    why: "1947, in caves near Qumran. They include an Isaiah scroll about 1,000 years older than earlier Hebrew copies." },
  { q: "In 1 Corinthians 15, Paul says the risen Jesus was seen by how many people at once?",
    options: ["Twelve", "Above five hundred", "Seventy", "Three"], answer: 1,
    why: "\"Above five hundred brethren at once; of whom the greater part remain unto this present.\" In other words, go ask them." },
  { q: "The \"free will defense\" to the problem of evil is most associated with which philosopher?",
    options: ["Friedrich Nietzsche", "Alvin Plantinga", "David Hume", "Karl Marx"], answer: 1,
    why: "Alvin Plantinga, *God, Freedom, and Evil* (1974)." },
  { q: "What is the first premise of the Kalam cosmological argument?",
    options: ["Everything has a cause", "Whatever begins to exist has a cause", "God exists", "The universe is infinite"], answer: 1,
    why: "\"Whatever *begins to exist* has a cause.\" That's why \"who made God?\" misses the point." },
  { q: "Which Old Testament book is about a righteous man who suffers terribly?",
    options: ["Ruth", "Job", "Jonah", "Esther"], answer: 1,
    why: "Job. Your own article suggests reading it in one sitting." },
  { q: "Which C. S. Lewis book says God \"shouts in our pains\"?",
    options: ["The Problem of Pain", "Narnia", "The Screwtape Letters", "Miracles"], answer: 0,
    why: "*The Problem of Pain* (1940), quoted in \"Questioning your faith?\"" },
  { q: "Which Gospel writer opens by saying he investigated eyewitness accounts carefully?",
    options: ["Mark", "John", "Luke", "Matthew"], answer: 2,
    why: "Luke 1:1-4, written to Theophilus \"that thou mightest know the certainty.\"" },
  { q: "Roughly how many Greek manuscripts of the New Testament survive?",
    options: ["About 10", "About 200", "Over 5,000", "Exactly 66"], answer: 2,
    why: "Over 5,000, far more than any other ancient book." }
];
