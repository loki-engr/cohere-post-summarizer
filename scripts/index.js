const loadButtons = () => {
  // don't want to add these buttons to main page
  // so if there is nothing after e.g. 'medium.com/' url we will just return
  if (window.location.pathname.length < 2) return;

  // Bottom button
  // add if there isn't already one (we can performe some events more than once, but don't want to add more than one button)
  if (!document.querySelector(".btn-bottom")) {
    const bottomBar =
      document.querySelector(
        "#root > div > div.l.c > div > div > div.v.w.x.y.z.ab.ac.ae.af > nav > div:nth-child(3) > div > div.ec.an.dp.ed > div"
      ) ||
      document.querySelector(
        "#root > div > div.y.c > div > div > div.jc.jd.je.jf.jg.jh.ji.jj.jk > nav > div:nth-child(3) > div > div > div"
      );

    // here we are creating structure for button
    const btnBottom = document.createElement("a");
    btnBottom.classList.add("btn-bottom");
    btnBottom.classList.add("btn-summary");
    btnBottom.textContent = "S";

    // we will create container for button
    const btnBottomContainer = document.createElement("div");
    btnBottomContainer?.classList.add("btn-container");

    // and then append container with button to the bar
    btnBottomContainer?.appendChild(btnBottom);
    bottomBar?.appendChild(btnBottomContainer);
  }

  // Side button
  if (document.querySelector(".btn-side")) return;

  const sideBar =
    document.querySelector(
      "#root > div > div.l.c > div > div > div.v.w.x.y.z.ab.ac.ae.af > nav > div.ag.h.k.j.i.cv > div"
    ) ||
    document.querySelector(
      "#root > div > div.y.c > div > div > div.jc.jd.je.jf.jg.jh.ji.jj.jk > nav > div.cx.h.k.j.i.hz > div"
    );

  const btnSide = document.createElement("a");
  btnSide.classList.add("btn-side");
  btnSide.classList.add("btn-summary");
  btnSide.textContent = "SUM";

  const btnSideContainer = document.createElement("div");
  btnSideContainer?.classList.add("btn-container");

  btnSideContainer?.appendChild(btnSide);
  sideBar?.appendChild(btnSideContainer);

  // for all buttons we want to add event listener that will call function for summarization
  const allButtons = document.querySelectorAll(".btn-summary");
  console.log(allButtons);
  allButtons.forEach((btn) => btn.addEventListener("click", prediction));
};

window.onload = () => {
  loadButtons();

  window.addEventListener("scroll", loadButtons);
  window.addEventListener("click", loadButtons);
};

// request to cohere xlarge model
const cohereReq = async (prompt) => {
  const modelSettings = JSON.stringify({
    model: "xlarge",
    prompt,
    max_tokens: 1024,
    temperature: 0.6,
    k: 0,
    p: 0.75,
  });

  const reqBody = {
    method: "POST",
    mode: "cors",
    headers: {
      Authorization: "BEARER {YOUR_COHERE_API_KEY}", // replace with your API key
      "Content-Type": "application/json",
      "Cohere-Version": "2021-11-08", // model version
      // I added some headers to prevent CORS errors
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
    },
    body: modelSettings,
    redirect: "follow",
  };

  // make request
  let response = await fetch("https://api.cohere.ai/generate", reqBody);
  response = response.json();

  return response;
};

const prediction = async (e) => {
  const articleElement = document.querySelector(
    "section > div > div:nth-child(2)"
  );

  // extract headings, text, skip images
  let texts = [];
  const heading = articleElement.querySelector("h1")?.textContent;

  // get text from each element
  for (const node of articleElement.childNodes || [])
    if (node.textContent !== heading) texts.push(node.textContent.split(" "));

  // flatten array
  texts = texts.flat();

  // remove empty strings
  texts = texts.filter((text) => text !== "" && text !== " ");

  const prompt = `Summarize shortly this article, without code! If you want to finish use '--'. Article:

Article heading: ${heading || texts[0]}

Article content: ${texts.slice(0, 800).join(" ")}
`;

  const response = await cohereReq(prompt);

  // from response get generations (if response exists), from generations get first element (if generations exist), and from it get text (if theres is element exists)
  const text = response?.generations?.shift()?.text;

  console.log(text);
};
