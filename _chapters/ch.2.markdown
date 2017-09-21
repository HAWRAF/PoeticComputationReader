---
title:  "Memory: to remember and forget"
summary: "Chapter Two considers the concept of memory as operative in computers and humans, showing not only how models of the human brain have influenced the development of computer interfaces, but how the distinctive qualities of human memory set it apart from machine—namely, plasticity and the ability to forget."
pdf: "/pdfs/chapterOne.pdf"
chapter: 2
page: 1
active: true
references:
  - title: 'Borges, Jorge Luis. “Funes the Memorious.” Translated by Anthony Kerrigan. New York: Grove Weidenfeld, 1962.'
  - title: 'Bush, Vannevar. “As We May Think.” Atlantic (July 1945). Accessed July 18, 2017.'
    link: 'https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/'
  - title: 'Chun, Wendy Hui Kyong. “The Enduring Ephemeral, or the Future is a Memory.” Critical Inquiry 35 (Autumn 2008). '
  - title: 'Malabou, Catherine. What Should We Do With Our Brain? Translated by Sebastian Rand. New York: Fordham University Press, 2009.'
  - title: 'Nelson, Theodor Holm. “Xanalogical Structure, Needed Now More than Ever: Parallel Documents, Deep Links to Content, Deep Versioning and Deep Re-Use.” Project Xanadu and Keio University, ACM Computing Surveys 31(4), (December 1999). '
  - title: 'Onuoha, Mimi. “What It Takes To Truly Delete Data.” FiveThirtyEight. Last modified January 30, 2016. '
    link: 'https://fivethirtyeight.com/features/what-it-takes-to-truly-delete-data/'
  - title: 'Shannon, Claude E. “A Mathematical Theory of Communication.” The Bell System Technical Journal, vol. 27 (1948): 379-423, 623-656. '
  - title: 'Wiener, Norbert. Cybernetics: Or Control and Communication in the Animal and the Machine. Cambridge, Massachusetts: MIT Press, 1948.'
sections:
  - title: "Introduction"
    paragraphs:
      - text: "In the first lecture, I want to talk about computation in its most rudimentary essence. I want to start today’s lecture by suggesting we think of the computer as an abacus, writing pad and clock. The abacus is a calculating tool for counting and simple mathematics. Although modern computers can calculate far larger sets of numbers in a very short period of time, its operation on a basic level is similar to the abacus: it adds, subtracts and compares bits of information. What about a writing pad? When you take notes on a writing pad, you press a pen onto the surface of the pad. The physical imprint on the pad leaves a trace that helps you remember information far beyond that moment. Similarly, a computer’s ability to store and recall information differentiates it from simple calculators. Finally, the clock-like function of computers greatly increases its power beyond its writing pad or abacus aspects. The clock enables instructions to be executed sequentially. It allows us to recall memory and designate tasks to the future."

      - text: "In this lecture, I’d like to focus on the writing pad (memory) aspect of computation, or more simply put, ‘computer memory.’ Although there is a distinction between digital memory and data, I will use 'computer memory' as an umbrella term to include both digital memory and data. I want to examine the concept of remembering and forgetting as technical qualities of computer memory. Do computers and humans do this the same way? And is the ability to remember as important as the ability to forget? My decision to focus on computer memory is because I want to put it in conversation with human memory."

      - text: "We’ll begin by talking about the Memex,<span class='citation-num'>1</span>  a hypothetical device that was designed to be an “enlarged intimate supplement” to human memory and that had a considerable influence on how engineers envisioned the function and future of computers. Despite certain similarities and metaphors that can and have been drawn between computer and human memory, it’s important not to overreach. To this end, I will introduce the concept of plasticity in the brain as a critical difference between human and computer memory. Lastly, I’ll raise the overarching question of what is poetical and political about computer memory."
        citations: 
          - text: 'Vannevar Bush,“As We May Think,”  Atlantic (July 1945). Accessed July 18, 2017. <a href="https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/">https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/</a>'

  - title: "To remember"
    paragraphs:
      - text: "To remember is to think and to think is to be human. What if we could remember everything? How would the condition of our lives change if we could retain memory of every single thing that happened in our lives? These are important questions to ask when we realize that the computer, as a technical device that records what we say and do by physically encoding our activity as data, significantly extends and expands ‘human memory.’ So let’s keep these questions in mind as we look at the historical development of computer memory. As you’ll see, it’s a history marked by misunderstanding, wishful thinking, as well as intuition—all of which, along the way, gave some insight into how human memory works."

      - text: "Around 1945, after WWII ended, scientists were concerned about the human capacity to deal with the impact of technological advancements spurred on by the war. Vannevar Bush, an American engineer who rose to prominence during World War II performing research for the military and who helped develop analog and mechanical computers, <span class='citation-num'>2</span>  published an essay in The Atlantic entitled “As We May Think” detailing these concerns.<span class='citation-num'>3</span> He claimed that the new technology would lead to a proliferation of information beyond what humans could reasonably manage."
        inlineImage:
          - src: "chapter-2/image3.png"
            caption: "Image: Via @ <a href='http://cs.brown.edu/~rms/50YearsAfter.pdf'>Vannevar Bush Symposium</a>"

      - text: "More specifically, Bush felt it’d be impossible for us to find the information we need because there’d be too much of it for us to effectively index or recall. To address this, Bush came up with an abstract machine called the Memex--a conceptual device with inputs, outputs, and an unlimited amount of storage for information. This device, designed to complement Bush’s understanding of the human mind, could help us deal with the growing volume of information."

      - text: "<span class='blockquote'> Selection by association, rather than indexing, may yet be mechanized. One cannot hope thus to equal the speed and flexibility with which the mind follows an associative trail, but it should be possible to beat the mind decisively in regard to the permanence and clarity of the items resurrected from storage. <span class='citation-num'>3</span></span> "
        inlineImage:
          - src: "chapter-2/image1.jpg"
            caption: "Illustration of Bush’s Memex: Via @ <a href='http://static1.1.sqspcdn.com/static/f/346077/3614949/1247871875603/As+We+May+Think+Vannevar+Bush+450910.pdf?token=XpHSolXcsNnzPRLb%2BLzW5fx2c04%3D'>Life Magazine</a>"

      - text: "Observing that the human mind operates on a principle of association rather than indexing, Bush designed the Memex to recreate a mechanized version of an “associative trail.” The idea is to add notes (what we might call “meta-data” today) to information to create a unique web of data connected by these “trails” of association.<span class='citation-num'>4</span> This ability to link certain information to other information is the core concept behind the Memex. In Bush’s view, the Memex machine could eliminate the need to remember everything all the time or to have to rummage through a huge pile of things on a desk (i.e. one’s memory) to access the wanted data."
        citations: 
          - text: 'From “As We May Think”: “One can consider rapid selection of this form, and distant projection for other purposes. To be able to key one sheet of a million before an operator in a second or two, with the possibility of then adding notes thereto, is suggestive in many ways. It might even be of use in libraries, but that is another story. At any rate, there are now some interesting combinations possible. One might, for example, speak to a microphone, in the manner described in connection with the speech controlled typewriter, and thus make his selections. It would certainly beat the usual file clerk.'
      - text: "This character of trails is similar to <a href='https://en.wikipedia.org/wiki/Hypertext'>Hypertext</a>, which demonstrates the essential characteristic of the World Wide Web. Hypertext is a powerful way to connect discrete items of information to each other. <span class='citation-num'>5</span>This feature of contextualizing information in a dynamic way is what differentiates reading online from reading physical books. We can see an early application of a similar concept in a fascinating undertaking called Project Xanadu.<span class='citation-num'>6</span>"
        citations: 
          - text: 'The World Wide Web is arguably the most prominent implementation of computers because it is essentially computers talking to one another.'
          - text: 'Theodor Holm Nelson, Xanalogical Structure, Needed Now More than Ever: Parallel Documents, Deep Links to Content, Deep Versioning and Deep Re-Use, Project Xanadu and Keio University, ACM Computing Surveys 31(4) (December 1999). Nelson also notes that the "famous trails of Vannevar Bushs memex system were to be built from transclusions, not links."'
          - text: 'Nelson considered the World Wide Web (WWW) a series of hierarchical structures and thought of Xanadu as a complete decentralization; as a result, he takes issue with the claim that Xanadu was the origin of the WWW. However, if we take a step back, we understand the two modes are not entirely exclusive: We find hierarchy and decentralization coexisting in the busy (complex) structures of the WWW.'
      - text: "As its creator Theodor Holm Nelson explained, Side-by-side connected comparison of parallel documents on the computer screen has always been Xanadu's fundamental visualization.<span class='citation-num'>7</span> This was not an attempt to create the World Wide Web; rather, Nelson had the more ambitious goal of changing the way we write and read by offering a distinctly anti-hierarchical approach to information, where the 'trails' are constantly adapting."
        inlineImage:
          - src: "chapter-2/image11.png"
            caption: "Douglas Engelbart: The Mother of All Demos: Via @  <a href='http://techvideo.com/douglas-engelbart-the-mother-of-all-demos-79-2/'>Tech Video</a>"
        citations: 
          - text: "Theodor Holm Nelson, “Xanalogical Structure, Needed Now More than Ever: Parallel Documents, Deep Links to Content, Deep Versioning and Deep Re-Use,” Project Xanadu and Keio University, ACM Computing Surveys 31(4) (December 1999). Nelson also notes that “the famous ‘trails’ of Vannevar Bush's memex system were to be built from transclusions, not links."
          - text: "Nelson considered the World Wide Web (WWW) a series of hierarchical structures and thought of Xanadu as a complete decentralization; as a result, he takes issue with the claim that Xanadu was the origin of the WWW. However, if we take a step back, we understand the two modes are not entirely exclusive: We find hierarchy and decentralization coexisting in the busy (complex) structures of the WWW."
      
      - text: 'This is quite different from Douglas Engelbarts <a href="http://dougengelbart.org/events/1968-demo-highlights.html">live demonstration</a> of “trails” in 1968 which featured a distinctly hierarchical system. In As We May Think, Bush offered a vision of what Human–Computer interaction could look like, deeply influencing generations of engineers and designers to come with technologists later adopting Bush’s vision, often times literally, to design and realize a new era of computers. Engelbart’s demonstration is the most well known of these realizations.'

        inlineImage:
          - src: "chapter-2/image10.jpg"
            caption: "Prototype Engelbart Mouse: Via @  <a href='https://upload.wikimedia.org/wikipedia/commons/2/2b/Douglas_Engelbart%27s_prototype_mouse_-_Computer_History_Museum.jpg'>Wikimedia Commons</a>"


      - text: "This demo not only debuted the first prototype of a computer mouse, but it showed how through the principles of linking data, the user could have a vastly more powerful interaction with a computer. <a href='https://www.youtube.com/watch?v=Xptc6f3Daoo'>In this video</a> [starting at 1:47], Engelbart creates a detailed shopping list and shows how he can modify the structure of the list based on different criteria. He first organizes the items according to type or category (i.e. produce vs. soup), then modifies items within that category (i.e. bananas and oranges under produce). Then using what he calls “View Control,” he collapses the items so that only the main categories show, then expands the list to show every item. The demo shows how information can be categorized and put into hierarchies according to one’s uses."

   

    



---
