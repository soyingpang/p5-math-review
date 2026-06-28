(function () {
  "use strict";

  const STORAGE_KEY = "coreReviewProgress.v2";
  const WRONG_KEY = "coreReviewWrongBank.v2";
  const SETTINGS_KEY = "coreReviewSettings.v2";
  const DAILY_KEY = "coreReviewDailyGoal.v1";

  const subjects = [
    { id: "chinese", short: "中", name: "中國語文", theme: "green" },
    { id: "english", short: "英", name: "English", theme: "blue" },
    { id: "math", short: "數", name: "Mathematics", theme: "amber" }
  ];

  const grades = [
    ["P1", "小一"], ["P2", "小二"], ["P3", "小三"], ["P4", "小四"], ["P5", "小五"], ["P6", "小六"],
    ["S1", "中一"], ["S2", "中二"], ["S3", "中三"], ["S4", "中四"], ["S5", "中五"], ["S6", "中六"]
  ].map(([id, name]) => ({ id, name }));

  const mathP5Topics = [
    {
      id: "5N1",
      domain: "數範疇",
      name: "多位數",
      focus: "讀寫、比較、四捨五入、估計大數量",
      summary: "比較多位數大小，按千、萬、十萬、百萬、千萬或億取近似值。",
      generators: [largeNumberCompare, largeNumberRound, oddEvenLarge]
    },
    {
      id: "5N2",
      domain: "數範疇",
      name: "分數（三）",
      focus: "異分母分數比較、加減及應用題",
      summary: "分母不超過 12 的異分母分數加減，並比較不超過三個分數。",
      generators: [fractionCompare, fractionAddSub, fractionWordAddSub]
    },
    {
      id: "5N3",
      domain: "數範疇",
      name: "分數（四）",
      focus: "不超過三個數的分數乘法",
      summary: "分數與整數的乘法，答案以最簡分數或帶分數表示。",
      generators: [fractionMultiply, fractionPartOf]
    },
    {
      id: "5N4",
      domain: "數範疇",
      name: "小數（三）",
      focus: "小數乘法、10/100/1000 及 0.1/0.01/0.001",
      summary: "小數乘整數、小數乘小數，以及按需要取近似值。",
      generators: [decimalScaleMultiply, decimalMultiply, decimalWord]
    },
    {
      id: "5N5",
      domain: "數範疇",
      name: "分數（五）",
      focus: "分數除法、四則混合、歸一法",
      summary: "分數和整數的除法與簡單混合運算，避免繁複計算。",
      generators: [fractionDivide, fractionMixed, unitaryFraction]
    },
    {
      id: "5A1",
      domain: "代數範疇",
      name: "代數的初步認識",
      focus: "用英文字母表示數及寫代數式",
      summary: "用一個未知量表達文字敘述中的數量關係。",
      generators: [algebraExpression, algebraEvaluate]
    },
    {
      id: "5A2",
      domain: "代數範疇",
      name: "簡易方程（一）",
      focus: "解一步或兩步整數係數方程",
      summary: "解 x + b = c、ax + b = c、x / a - b = c 等方程並驗算。",
      generators: [simpleEquation, equationWord]
    },
    {
      id: "5M1",
      domain: "度量範疇",
      name: "面積（二）",
      focus: "平行四邊形、三角形、梯形及多邊形面積",
      summary: "辨認高，運用公式求平面圖形和簡單組合圖形面積。",
      generators: [areaParallelogram, areaTriangleTrapezium, areaComposite]
    },
    {
      id: "5M2",
      domain: "度量範疇",
      name: "體積（一）",
      focus: "立方厘米、立方米、正方體及長方體體積",
      summary: "用長 × 闊 × 高求體積，處理簡單拼砌立體圖形。",
      generators: [volumeCuboid, volumeComposite, volumeCompare]
    },
    {
      id: "5S1",
      domain: "圖形與空間範疇",
      name: "圓",
      focus: "圓心、半徑、直徑、圓周和基本性質",
      summary: "理解直徑是半徑的 2 倍，圓上各點到圓心距離相同。",
      generators: [circleRadiusDiameter, circleProperties]
    },
    {
      id: "5S2",
      domain: "圖形與空間範疇",
      name: "立體圖形（三）",
      focus: "截面、頂點、稜、摺紙圖樣及球的性質",
      summary: "認識角柱、圓柱、角錐、圓錐、球、正方體和長方體。",
      generators: [solidCrossSection, solidCounts, solidNet]
    },
    {
      id: "5D1",
      domain: "數據處理範疇",
      name: "棒形圖（三）",
      focus: "複合棒形圖的認識、闡釋和製作",
      summary: "閱讀橫向和縱向複合棒形圖，一格代表 1000、10000 或 100000。",
      generators: [barChartRead, barChartDifference, barChartScale]
    }
  ];

  const curriculumBlueprint = {
    chinese: {
      primary: [
        ["字詞認讀", "識字、字形、字音、字義和常用詞語。"],
        ["閱讀理解", "找重點、理解段意、推斷人物和事件。"],
        ["句子運用", "標點、句式、連接詞和修辭入門。"],
        ["寫作表達", "看圖寫句、短段、記敘和實用文。"],
        ["聆聽說話", "聽取重點、清楚表達和日常溝通。"]
      ],
      junior: [
        ["閱讀策略", "概括主旨、分析結構、語氣和寫作手法。"],
        ["文言基礎", "常見文言詞、句式和篇章理解。"],
        ["寫作訓練", "記敘、描寫、說明、議論和材料運用。"],
        ["語文知識", "詞類、句子、修辭和標點運用。"],
        ["說話能力", "匯報、討論、演講和回應技巧。"]
      ],
      senior: [
        ["閱讀卷訓練", "篇章理解、比較、評價和答題組織。"],
        ["寫作卷訓練", "審題、立意、材料組織和表達層次。"],
        ["文言閱讀", "實詞、虛詞、句式、翻譯和內容分析。"],
        ["綜合能力", "整合材料、轉述、歸納和實用寫作。"],
        ["口語溝通", "小組討論、個人短講和論點回應。"]
      ]
    },
    english: {
      primary: [
        ["Vocabulary", "High-frequency words, word families and topic vocabulary."],
        ["Grammar", "Tenses, pronouns, prepositions, conjunctions and sentence patterns."],
        ["Reading", "Main ideas, details, inference and text features."],
        ["Writing", "Sentences, short paragraphs, stories, emails and descriptions."],
        ["Speaking & Listening", "Everyday responses, instructions and short presentations."]
      ],
      junior: [
        ["Vocabulary", "Word formation, collocations, tone and context clues."],
        ["Grammar", "Tenses, clauses, modals, reported speech and sentence variety."],
        ["Reading Skills", "Skimming, scanning, inference, writer's attitude and text type."],
        ["Writing Skills", "Paragraphing, cohesion, formal and informal writing."],
        ["Oral Communication", "Discussion, presentation, elaboration and interaction."]
      ],
      senior: [
        ["Reading Paper", "Inference, comparison, tone, purpose and evidence-based answers."],
        ["Writing Paper", "Genre, register, argument, organization and language accuracy."],
        ["Vocabulary & Usage", "Precise wording, collocations, idioms and academic phrases."],
        ["Listening & Integrated Skills", "Note-taking, data transfer, synthesis and task completion."],
        ["Speaking", "Individual response, group interaction and persuasive support."]
      ]
    },
    math: {
      primary: [
        ["數與運算", "整數、四則運算、估算、倍數和因數。"],
        ["分數與小數", "分數、小數、百分數和互化。"],
        ["度量", "長度、重量、容量、時間、周界、面積和體積。"],
        ["圖形與空間", "平面圖形、立體圖形、角、對稱和方向。"],
        ["數據處理", "表格、象形圖、棒形圖、折線圖和平均數。"]
      ],
      junior: [
        ["數與代數", "有向數、指數、百分法、代數式和方程。"],
        ["圖形與空間", "角、三角形、四邊形、圓、相似和坐標。"],
        ["度量與幾何", "周界、面積、體積、畢氏定理和三角比入門。"],
        ["數據處理", "統計圖、平均數、中位數、概率和變異。"],
        ["函數與關係", "公式、變量、線性關係和圖像。"]
      ],
      senior: [
        ["數與代數", "二次方程、不等式、指數、對數和數列。"],
        ["函數與圖像", "多項式、指數、對數、三角函數和變換。"],
        ["坐標幾何", "直線、圓、距離、斜率和軌跡。"],
        ["微積分基礎", "極限概念、導數、應用和面積。"],
        ["統計與概率", "排列組合、概率分佈、抽樣和數據分析。"]
      ]
    }
  };

  const gradeBand = (gradeId) => {
    if (gradeId.startsWith("P")) return "primary";
    if (["S1", "S2", "S3"].includes(gradeId)) return "junior";
    return "senior";
  };

  const subjectName = (subjectId) => subjects.find((item) => item.id === subjectId)?.name || "Mathematics";
  const gradeName = (gradeId) => grades.find((item) => item.id === gradeId)?.name || "小五";

  function buildTopics(subjectId, gradeId) {
    if (subjectId === "math" && gradeId === "P5") {
      return mathP5Topics.map((topic) => ({
        ...topic,
        id: `math-P5-${topic.id}`,
        originalId: topic.id,
        subjectId,
        gradeId
      }));
    }

    const band = gradeBand(gradeId);
    const source = curriculumBlueprint[subjectId][band];
    return source.map((item, index) => {
      const code = `${subjects.find((subject) => subject.id === subjectId).short}${gradeId}-${index + 1}`;
      return {
        id: `${subjectId}-${gradeId}-${index + 1}`,
        originalId: code,
        subjectId,
        gradeId,
        domain: subjectName(subjectId),
        name: item[0],
        focus: item[1],
        summary: `${gradeName(gradeId)} ${subjectName(subjectId)}：${item[1]}`,
        generators: [genericQuestion]
      };
    });
  }

  const savedSettings = loadSettings();

  let state = {
    subject: savedSettings.subject || "math",
    grade: savedSettings.grade || "P5",
    selectedTopic: savedSettings.selectedTopic || "",
    mode: savedSettings.mode || "practice",
    view: savedSettings.view || "practice",
    current: null,
    selectedChoice: null,
    checked: false,
    streak: 0,
    progress: loadProgress(),
    wrongBank: loadWrongBank(),
    daily: loadDailyGoal()
  };

  let topics = buildTopics(state.subject, state.grade);
  if (!topics.some((topic) => topic.id === state.selectedTopic)) {
    state.selectedTopic = topics[0].id;
  }

  const els = {
    answeredCount: document.getElementById("answeredCount"),
    accuracyRate: document.getElementById("accuracyRate"),
    streakCount: document.getElementById("streakCount"),
    wrongBankCount: document.getElementById("wrongBankCount"),
    subjectTabs: document.getElementById("subjectTabs"),
    gradeSelect: document.getElementById("gradeSelect"),
    mobileSubject: document.getElementById("mobileSubject"),
    mobileGrade: document.getElementById("mobileGrade"),
    dailyGoalTarget: document.getElementById("dailyGoalTarget"),
    dailyGoalDone: document.getElementById("dailyGoalDone"),
    dailyGoalText: document.getElementById("dailyGoalText"),
    dailyGoalBar: document.getElementById("dailyGoalBar"),
    mobileDailyGoalText: document.getElementById("mobileDailyGoalText"),
    mobileDailyGoalDone: document.getElementById("mobileDailyGoalDone"),
    mobileDailyGoalBar: document.getElementById("mobileDailyGoalBar"),
    topicList: document.getElementById("topicList"),
    curriculumGrid: document.getElementById("curriculumGrid"),
    domainSummary: document.getElementById("domainSummary"),
    topicProgressGrid: document.getElementById("topicProgressGrid"),
    overallRing: document.getElementById("overallRing"),
    overallPercent: document.getElementById("overallPercent"),
    progressSummary: document.getElementById("progressSummary"),
    miniWeakList: document.getElementById("miniWeakList"),
    weakList: document.getElementById("weakList"),
    unitLabel: document.getElementById("unitLabel"),
    modeLabel: document.getElementById("modeLabel"),
    focusLabel: document.getElementById("focusLabel"),
    activeTopicCode: document.getElementById("activeTopicCode"),
    activeTopicName: document.getElementById("activeTopicName"),
    activeTopicSummary: document.getElementById("activeTopicSummary"),
    topicMasteryText: document.getElementById("topicMasteryText"),
    topicMasteryBar: document.getElementById("topicMasteryBar"),
    questionPanel: document.querySelector(".question-panel"),
    topicPill: document.getElementById("topicPill"),
    questionMetaPill: document.getElementById("questionMetaPill"),
    questionTitle: document.getElementById("questionTitle"),
    questionText: document.getElementById("questionText"),
    diagramArea: document.getElementById("diagramArea"),
    answerArea: document.getElementById("answerArea"),
    feedbackBox: document.getElementById("feedbackBox"),
    checkAnswer: document.getElementById("checkAnswer"),
    showHint: document.getElementById("showHint"),
    skipQuestion: document.getElementById("skipQuestion"),
    newQuestion: document.getElementById("newQuestion"),
    nextQuestionCta: document.getElementById("nextQuestionCta"),
    resetProgress: document.getElementById("resetProgress")
  };

  init();

  function init() {
    preferMobilePracticeStart();
    renderSubjectControls();
    renderGradeControls();
    renderViewTabs();
    renderTopicList();
    renderCurriculumGrid();
    renderDomainSummary();
    bindEvents();
    setModeButtons();
    updateSubjectTheme();
    nextQuestion();
    updateStats();
    registerServiceWorker();
  }

  function bindEvents() {
    els.subjectTabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-subject]");
      if (!button) return;
      changeCourse(button.dataset.subject, state.grade);
    });

    els.gradeSelect.addEventListener("change", () => changeCourse(state.subject, els.gradeSelect.value));
    els.mobileSubject.addEventListener("change", () => changeCourse(els.mobileSubject.value, state.grade));
    els.mobileGrade.addEventListener("change", () => changeCourse(state.subject, els.mobileGrade.value));
    els.dailyGoalTarget.addEventListener("change", () => {
      state.daily.target = Number(els.dailyGoalTarget.value);
      saveDailyGoal();
      renderDailyGoal();
    });

    document.querySelectorAll("[data-mobile-view]").forEach((button) => {
      button.addEventListener("click", () => {
        state.view = button.dataset.mobileView;
        saveSettings();
        renderViewTabs();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    document.querySelectorAll(".page-tab").forEach((button) => {
      button.addEventListener("click", () => {
        state.view = button.dataset.view;
        saveSettings();
        renderViewTabs();
      });
    });

    els.topicList.addEventListener("click", (event) => {
      const button = event.target.closest(".topic-button");
      if (!button) return;
      state.selectedTopic = button.dataset.topic;
      state.mode = "practice";
      state.view = "practice";
      saveSettings();
      renderViewTabs();
      setModeButtons();
      renderTopicList();
      renderSessionPanel();
      nextQuestion();
    });

    els.curriculumGrid.addEventListener("click", (event) => {
      const card = event.target.closest(".curriculum-card");
      if (!card) return;
      state.selectedTopic = card.dataset.topic;
      state.mode = "practice";
      state.view = "practice";
      saveSettings();
      renderViewTabs();
      setModeButtons();
      renderTopicList();
      renderSessionPanel();
      nextQuestion();
    });

    document.querySelectorAll(".segment").forEach((button) => {
      button.addEventListener("click", () => {
        state.mode = button.dataset.mode;
        saveSettings();
        setModeButtons();
        nextQuestion();
      });
    });

    els.checkAnswer.addEventListener("click", checkCurrentAnswer);
    els.showHint.addEventListener("click", showHint);
    els.skipQuestion.addEventListener("click", goToNextQuestion);
    els.newQuestion.addEventListener("click", goToNextQuestion);
    els.nextQuestionCta.addEventListener("click", goToNextQuestion);
    els.resetProgress.addEventListener("click", resetProgress);

    document.addEventListener("keydown", (event) => {
      if (state.current?.type === "choice") {
        const index = choiceIndexFromKey(event.key);
        if (index >= 0) {
          const choices = els.answerArea.querySelectorAll(".choice-button");
          if (choices[index]) {
            choices[index].click();
            event.preventDefault();
          }
        }
      }

      if (event.key !== "Enter") return;
      const active = document.activeElement;
      if (active && active.classList.contains("answer-input")) {
        checkCurrentAnswer();
      } else if (state.current?.type === "choice" && state.selectedChoice) {
        checkCurrentAnswer();
      }
    });
  }

  function preferMobilePracticeStart() {
    if (!window.matchMedia || !window.matchMedia("(max-width: 720px)").matches) return;
    if (state.view === "practice") return;
    state.view = "practice";
    saveSettings();
  }

  function renderViewTabs() {
    document.body.dataset.view = state.view;
    document.querySelectorAll(".page-tab").forEach((button) => {
      const active = button.dataset.view === state.view;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });
    document.querySelectorAll("[data-view-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.viewPanel === state.view);
    });
  }

  function renderSubjectControls() {
    const html = subjects.map((subject) => `
      <button class="subject-tab" type="button" data-subject="${subject.id}" aria-pressed="${subject.id === state.subject ? "true" : "false"}">
        <span>${subject.short}</span>
        <strong>${subject.name}</strong>
      </button>
    `).join("");
    els.subjectTabs.innerHTML = html;
    els.mobileSubject.innerHTML = subjects.map((subject) => `<option value="${subject.id}">${subject.short} ${subject.name}</option>`).join("");
    els.mobileSubject.value = state.subject;
  }

  function renderGradeControls() {
    const html = grades.map((grade) => `<option value="${grade.id}">${grade.name}</option>`).join("");
    els.gradeSelect.innerHTML = html;
    els.mobileGrade.innerHTML = html;
    els.gradeSelect.value = state.grade;
    els.mobileGrade.value = state.grade;
  }

  function changeCourse(subjectId, gradeId) {
    state.subject = subjectId;
    state.grade = gradeId;
    topics = buildTopics(state.subject, state.grade);
    state.selectedTopic = topics[0].id;
    state.mode = "practice";
    state.view = "practice";
    state.checked = false;
    state.selectedChoice = null;
    saveSettings();
    renderSubjectControls();
    renderGradeControls();
    renderViewTabs();
    setModeButtons();
    updateSubjectTheme();
    nextQuestion();
    updateStats();
  }

  function updateSubjectTheme() {
    document.body.dataset.subject = state.subject;
  }

  function renderTopicList() {
    els.topicList.innerHTML = "";
    topics.forEach((topic) => {
      const stats = getTopicStats(topic.id);
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.topic = topic.id;
      button.className = `topic-button${topic.id === state.selectedTopic ? " active" : ""}`;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", topic.id === state.selectedTopic ? "true" : "false");
      const mastery = getMastery(stats);
      button.innerHTML = `
        <span class="topic-code">${topicCode(topic)}</span>
        <span>
          <span class="topic-name">${topic.name}</span>
          <span class="topic-progress">${topic.domain}</span>
        </span>
        <span class="topic-accuracy">${formatAccuracy(stats)}</span>
        <span class="topic-mini-track" aria-hidden="true"><span style="width: ${mastery}%"></span></span>
      `;
      els.topicList.appendChild(button);
    });
  }

  function renderCurriculumGrid() {
    els.curriculumGrid.innerHTML = "";
    topics.forEach((topic) => {
      const stats = getTopicStats(topic.id);
      const mastery = getMastery(stats);
      const card = document.createElement("article");
      card.className = "curriculum-card";
      card.dataset.topic = topic.id;
      card.innerHTML = `
        <div class="question-tags">
          <span class="topic-pill">${topicCode(topic)}</span>
          <span class="meta-pill">${topic.domain}</span>
        </div>
        <h3>${topic.name}</h3>
        <p>${topic.summary}</p>
        <div class="progress-track" aria-hidden="true"><span style="width: ${mastery}%"></span></div>
      `;
      els.curriculumGrid.appendChild(card);
    });
  }

  function renderDomainSummary() {
    const domains = topics.reduce((acc, topic) => {
      if (!acc[topic.domain]) acc[topic.domain] = [];
      acc[topic.domain].push(topic);
      return acc;
    }, {});

    els.domainSummary.innerHTML = Object.entries(domains)
      .map(([domain, items]) => {
        const answered = items.reduce((sum, topic) => sum + getTopicStats(topic.id).answered, 0);
        const correct = items.reduce((sum, topic) => sum + getTopicStats(topic.id).correct, 0);
        const accuracy = answered ? `${Math.round((correct / answered) * 100)}%` : "--";
        return `
          <article class="domain-card">
            <strong>${domain}</strong>
            <span>${items.length} 個單元 · 已答 ${answered} 題 · 準確率 ${accuracy}</span>
          </article>
        `;
      })
      .join("");
  }

  function renderProgressGrid() {
    els.topicProgressGrid.innerHTML = topics
      .map((topic) => {
        const stats = getTopicStats(topic.id);
        const mastery = getMastery(stats);
        const answeredText = stats.answered ? `已答 ${stats.answered} 題` : "未開始";
        return `
          <article class="progress-card">
            <div>
              <h3>${topicCode(topic)} ${topic.name}</h3>
              <p>${topic.domain} · ${answeredText}</p>
            </div>
            <strong>${formatAccuracy(stats)}</strong>
            <div class="progress-track" aria-hidden="true"><span style="width: ${mastery}%"></span></div>
          </article>
        `;
      })
      .join("");
  }

  function updateStats() {
    const totals = topics.map((topic) => getTopicStats(topic.id)).reduce(
      (acc, item) => {
        acc.answered += item.answered || 0;
        acc.correct += item.correct || 0;
        return acc;
      },
      { answered: 0, correct: 0 }
    );

    els.answeredCount.textContent = String(totals.answered);
    els.accuracyRate.textContent = totals.answered ? `${Math.round((totals.correct / totals.answered) * 100)}%` : "--";
    els.streakCount.textContent = String(state.streak);
    els.wrongBankCount.textContent = String(state.wrongBank.filter((item) => item.subjectId === state.subject && item.gradeId === state.grade).length);
    const overall = totals.answered ? Math.round((totals.correct / totals.answered) * 100) : 0;
    els.overallRing.style.setProperty("--percent", String(overall));
    els.overallPercent.textContent = totals.answered ? `${overall}%` : "--";
    els.progressSummary.textContent = totals.answered
      ? `已完成 ${totals.answered} 題，答對 ${totals.correct} 題。`
      : "未有答題紀錄。";
    renderTopicList();
    renderCurriculumGrid();
    renderDomainSummary();
    renderProgressGrid();
    renderSessionPanel();
    renderWeakList();
    renderDailyGoal();
  }

  function renderSessionPanel() {
    const topic = getTopic(state.selectedTopic);
    const stats = getTopicStats(topic.id);
    const mastery = getMastery(stats);
    els.activeTopicCode.textContent = topicCode(topic);
    els.activeTopicName.textContent = topic.name;
    els.activeTopicSummary.textContent = topic.summary;
    els.topicMasteryText.textContent = formatAccuracy(stats);
    els.topicMasteryBar.style.width = `${mastery}%`;
  }

  function renderWeakList() {
    const weak = topics
      .map((topic) => ({ topic, stats: getTopicStats(topic.id) }))
      .filter((entry) => entry.stats.answered >= 2)
      .sort((a, b) => accuracyValue(a.stats) - accuracyValue(b.stats))
      .slice(0, 4);

    if (!weak.length) {
      const text = "暫未有弱項紀錄。";
      els.weakList.textContent = text;
      els.miniWeakList.textContent = text;
      return;
    }

    const html = weak
      .map((entry) => `
        <div class="weak-item">
          <span>${topicCode(entry.topic)} ${entry.topic.name}</span>
          <strong>${formatAccuracy(entry.stats)}</strong>
        </div>
      `)
      .join("");
    els.weakList.innerHTML = html;
    els.miniWeakList.innerHTML = html;
  }

  function setModeButtons() {
    document.querySelectorAll(".segment").forEach((button) => {
      const active = button.dataset.mode === state.mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    els.modeLabel.textContent = modeName(state.mode);
  }

  function nextQuestion() {
    state.checked = false;
    state.selectedChoice = null;
    clearFeedback();

    let question;
    if (state.mode === "wrong") {
      question = drawWrongQuestion();
      if (!question) {
        state.mode = "practice";
        setModeButtons();
        question = generateQuestion(getTopic(state.selectedTopic));
        showInlineMessage("暫時未有錯題，已返回專題練習。", "hint");
      }
    } else if (state.mode === "mixed") {
      question = generateQuestion(pickMixedTopic());
    } else {
      question = generateQuestion(getTopic(state.selectedTopic));
    }

    state.current = question;
    renderQuestion(question);
  }

  function goToNextQuestion() {
    nextQuestion();
    scrollQuestionIntoView();
  }

  function isMobileViewport() {
    return window.matchMedia && window.matchMedia("(max-width: 720px)").matches;
  }

  function scrollQuestionIntoView() {
    if (!isMobileViewport()) return;
    requestAnimationFrame(() => {
      els.questionPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function scrollFeedbackIntoView() {
    if (!isMobileViewport()) return;
    requestAnimationFrame(() => {
      els.feedbackBox.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function generateQuestion(topic) {
    const generator = sample(topic.generators);
    return {
      topicId: topic.id,
      topicCode: topicCode(topic),
      topicName: topic.name,
      domain: topic.domain,
      focus: topic.focus,
      subjectId: topic.subjectId,
      gradeId: topic.gradeId,
      ...generator(topic)
    };
  }

  function renderQuestion(question) {
    els.unitLabel.textContent = `${question.topicCode} ${question.topicName}`;
    els.modeLabel.textContent = modeName(state.mode);
    els.focusLabel.textContent = question.focus;
    els.topicPill.textContent = question.topicCode;
    els.questionMetaPill.textContent = modeName(state.mode);
    els.questionTitle.textContent = question.title;
    els.questionText.innerHTML = question.prompt;
    els.diagramArea.innerHTML = question.diagram || "";
    els.answerArea.innerHTML = "";

    if (question.type === "choice") {
      question.choices.forEach((choice, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "choice-button";
        button.dataset.value = choice.value;
        button.setAttribute("aria-pressed", "false");
        button.innerHTML = `<span class="choice-letter">${String.fromCharCode(65 + index)}</span><span>${choice.label}</span>`;
        button.addEventListener("click", () => selectChoice(button, choice.value));
        els.answerArea.appendChild(button);
      });
    } else {
      const input = document.createElement("input");
      input.className = "answer-input";
      input.type = "text";
      input.inputMode = "decimal";
      input.autocomplete = "off";
      input.placeholder = question.placeholder || "輸入答案";
      els.answerArea.appendChild(input);
      input.focus();
    }
  }

  function selectChoice(button, value) {
    if (state.checked) return;
    state.selectedChoice = value;
    els.answerArea.querySelectorAll(".choice-button").forEach((item) => {
      item.classList.remove("selected");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("selected");
    button.setAttribute("aria-pressed", "true");
  }

  function checkCurrentAnswer() {
    const question = state.current;
    if (!question || state.checked) return;

    const userAnswer = question.type === "choice"
      ? state.selectedChoice
      : (els.answerArea.querySelector(".answer-input")?.value || "");

    if (!String(userAnswer).trim()) {
      showInlineMessage("請先選擇或輸入答案。", "hint");
      return;
    }

    const correct = isCorrect(question, userAnswer);
    state.checked = true;
    updateProgress(question.topicId, correct);
    incrementDailyGoal();
    markChoices(question, userAnswer);

    if (correct) {
      state.streak += 1;
      removeWrong(question);
      showInlineMessage(`<strong>答對。</strong><br>${question.work}`, "good");
    } else {
      state.streak = 0;
      rememberWrong(question);
      showInlineMessage(`<strong>未啱。</strong> 正確答案係 <strong>${question.answerLabel}</strong>。<br>${question.work}`, "bad");
    }

    updateStats();
    els.nextQuestionCta.hidden = false;
    document.body.classList.add("answer-reviewed");
    scrollFeedbackIntoView();
  }

  function markChoices(question, userAnswer) {
    if (question.type !== "choice") return;
    els.answerArea.querySelectorAll(".choice-button").forEach((button) => {
      button.disabled = true;
      if (String(button.dataset.value) === String(question.answer)) {
        button.classList.add("correct");
      } else if (String(button.dataset.value) === String(userAnswer)) {
        button.classList.add("wrong");
      }
    });
  }

  function showHint() {
    if (!state.current) return;
    showInlineMessage(`<strong>提示：</strong>${state.current.hint}`, "hint");
  }

  function showInlineMessage(html, kind) {
    els.feedbackBox.innerHTML = html;
    els.feedbackBox.className = `feedback show ${kind}`;
  }

  function clearFeedback() {
    els.feedbackBox.innerHTML = "";
    els.feedbackBox.className = "feedback";
    els.nextQuestionCta.hidden = true;
    document.body.classList.remove("answer-reviewed");
  }

  function isCorrect(question, userAnswer) {
    if (question.type === "choice") {
      return String(userAnswer) === String(question.answer);
    }

    const expected = question.answer;
    const normalized = normalizeAnswer(userAnswer);
    if (question.acceptType === "fraction") {
      const parsed = parseFraction(normalized);
      return parsed && parsed.n === expected.n && parsed.d === expected.d;
    }
    if (question.acceptType === "number") {
      const value = Number(normalized);
      return Number.isFinite(value) && Math.abs(value - Number(expected)) < 0.000001;
    }
    return normalized === normalizeAnswer(expected);
  }

  function normalizeAnswer(value) {
    return String(value)
      .trim()
      .replace(/[，,]/g, "")
      .replace(/[＝=]/g, "")
      .replace(/／/g, "/")
      .replace(/厘米|平方|立方|cm2|cm3|cm²|cm³|cm|個|元|米|m2|m3|m²|m³/g, "")
      .replace(/\s+/g, "");
  }

  function updateProgress(topicId, correct) {
    const stats = getTopicStats(topicId);
    stats.answered += 1;
    if (correct) stats.correct += 1;
    state.progress[topicId] = stats;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
  }

  function resetProgress() {
    if (!window.confirm("確定重設所有進度同錯題？")) return;
    state.progress = {};
    state.wrongBank = [];
    state.daily = { date: todayKey(), target: state.daily.target || 10, done: 0 };
    state.streak = 0;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(WRONG_KEY);
    saveDailyGoal();
    updateStats();
    nextQuestion();
  }

  function getTopicStats(topicId) {
    return state.progress[topicId] || { answered: 0, correct: 0 };
  }

  function formatAccuracy(stats) {
    if (!stats.answered) return "--";
    return `${Math.round((stats.correct / stats.answered) * 100)}%`;
  }

  function accuracyValue(stats) {
    return stats.answered ? stats.correct / stats.answered : 1;
  }

  function getMastery(stats) {
    if (!stats.answered) return 0;
    const accuracy = stats.correct / stats.answered;
    const confidence = Math.min(stats.answered / 8, 1);
    return Math.round(accuracy * confidence * 100);
  }

  function modeName(mode) {
    if (mode === "mixed") return "綜合";
    if (mode === "wrong") return "錯題";
    return "專題";
  }

  function topicCode(topic) {
    return topic.originalId || topic.id;
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function choiceIndexFromKey(key) {
    const normalized = String(key).toLowerCase();
    if (/^[1-4]$/.test(normalized)) return Number(normalized) - 1;
    return ["a", "b", "c", "d"].indexOf(normalized);
  }

  function pickMixedTopic() {
    const weighted = topics.map((topic) => {
      const stats = getTopicStats(topic.id);
      const accuracyGap = stats.answered ? 1 - accuracyValue(stats) : 0.45;
      const wrongBoost = state.wrongBank.some((item) => item.topicId === topic.id) ? 1.25 : 0;
      const freshBoost = stats.answered ? 0 : 0.75;
      return {
        topic,
        weight: 1 + accuracyGap * 3 + wrongBoost + freshBoost
      };
    });
    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    let cursor = Math.random() * total;
    for (const item of weighted) {
      cursor -= item.weight;
      if (cursor <= 0) return item.topic;
    }
    return sample(topics);
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      subject: state.subject,
      grade: state.grade,
      selectedTopic: state.selectedTopic,
      mode: state.mode,
      view: state.view
    }));
  }

  function loadDailyGoal() {
    const fallback = { date: todayKey(), target: 10, done: 0 };
    try {
      const stored = JSON.parse(localStorage.getItem(DAILY_KEY) || "null");
      if (!stored || stored.date !== todayKey()) return fallback;
      return {
        date: stored.date,
        target: Number(stored.target) || 10,
        done: Number(stored.done) || 0
      };
    } catch {
      return fallback;
    }
  }

  function saveDailyGoal() {
    localStorage.setItem(DAILY_KEY, JSON.stringify(state.daily));
  }

  function incrementDailyGoal() {
    if (state.daily.date !== todayKey()) {
      state.daily = { date: todayKey(), target: state.daily.target || 10, done: 0 };
    }
    state.daily.done += 1;
    saveDailyGoal();
  }

  function renderDailyGoal() {
    if (state.daily.date !== todayKey()) {
      state.daily = { date: todayKey(), target: state.daily.target || 10, done: 0 };
      saveDailyGoal();
    }
    const percent = Math.min(100, Math.round((state.daily.done / state.daily.target) * 100));
    els.dailyGoalTarget.value = String(state.daily.target);
    els.dailyGoalText.textContent = `今日 ${state.daily.done} / ${state.daily.target} 題`;
    els.dailyGoalDone.textContent = percent >= 100 ? "已達標" : `尚差 ${Math.max(0, state.daily.target - state.daily.done)} 題`;
    els.dailyGoalBar.style.width = `${percent}%`;
    els.mobileDailyGoalText.textContent = `今日 ${state.daily.done} / ${state.daily.target} 題`;
    els.mobileDailyGoalDone.textContent = percent >= 100 ? "已達標" : `尚差 ${Math.max(0, state.daily.target - state.daily.done)} 題`;
    els.mobileDailyGoalBar.style.width = `${percent}%`;
  }

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function loadWrongBank() {
    try {
      return JSON.parse(localStorage.getItem(WRONG_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function rememberWrong(question) {
    const record = JSON.parse(JSON.stringify(question));
    state.wrongBank = state.wrongBank.filter((item) => item.key !== record.key);
    state.wrongBank.unshift(record);
    state.wrongBank = state.wrongBank.slice(0, 40);
    localStorage.setItem(WRONG_KEY, JSON.stringify(state.wrongBank));
  }

  function removeWrong(question) {
    state.wrongBank = state.wrongBank.filter((item) => item.key !== question.key);
    localStorage.setItem(WRONG_KEY, JSON.stringify(state.wrongBank));
  }

  function drawWrongQuestion() {
    const scoped = state.wrongBank.filter((item) => item.subjectId === state.subject && item.gradeId === state.grade);
    if (!scoped.length) return null;
    return { ...sample(scoped) };
  }

  function getTopic(id) {
    return topics.find((topic) => topic.id === id) || topics[0];
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function sample(list) {
    return list[randInt(0, list.length - 1)];
  }

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = randInt(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      [x, y] = [y, x % y];
    }
    return x || 1;
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  function frac(n, d) {
    const sign = d < 0 ? -1 : 1;
    const divisor = gcd(n, d);
    return { n: sign * n / divisor, d: Math.abs(d) / divisor };
  }

  function addFrac(a, b) {
    return frac(a.n * b.d + b.n * a.d, a.d * b.d);
  }

  function subFrac(a, b) {
    return frac(a.n * b.d - b.n * a.d, a.d * b.d);
  }

  function mulFrac(a, b) {
    return frac(a.n * b.n, a.d * b.d);
  }

  function divFrac(a, b) {
    return frac(a.n * b.d, a.d * b.n);
  }

  function compareFrac(a, b) {
    return a.n * b.d - b.n * a.d;
  }

  function formatFrac(value) {
    if (value.d === 1) return String(value.n);
    if (Math.abs(value.n) > value.d) {
      const whole = Math.trunc(value.n / value.d);
      const remainder = Math.abs(value.n % value.d);
      return remainder ? `${whole} ${remainder}/${value.d}` : String(whole);
    }
    return `${value.n}/${value.d}`;
  }

  function formatFracHtml(value) {
    return formatFrac(value).replace(" ", " 又 ");
  }

  function parseFraction(value) {
    const text = String(value).replace(/又/g, " ").trim();
    const mixed = text.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
    if (mixed) {
      const whole = Number(mixed[1]);
      const n = Number(mixed[2]);
      const d = Number(mixed[3]);
      return frac(whole * d + Math.sign(whole || 1) * n, d);
    }
    const simple = text.match(/^(-?\d+)\/(\d+)$/);
    if (simple) return frac(Number(simple[1]), Number(simple[2]));
    const integer = text.match(/^-?\d+$/);
    if (integer) return frac(Number(text), 1);
    return null;
  }

  function makeChoices(correctLabel, distractors) {
    const unique = [];
    [correctLabel, ...distractors].forEach((item) => {
      const label = String(item);
      if (!unique.includes(label)) unique.push(label);
    });
    const numericAnswer = Number(String(correctLabel).replace(/,/g, ""));
    if (Number.isFinite(numericAnswer)) {
      [1, -1, 2, -2, 5, -5, 10, -10].forEach((offset) => {
        const candidateNumber = cleanDecimal(numericAnswer + offset);
        const candidate = String(correctLabel).includes(",")
          ? formatNumber(candidateNumber)
          : String(candidateNumber);
        if (unique.length < 4 && !unique.includes(candidate)) unique.push(candidate);
      });
    }
    return shuffle(unique.slice(0, 4)).map((label) => ({ label, value: label }));
  }

  function makeChoiceQuestion(base, answerLabel, distractors) {
    return {
      ...base,
      type: "choice",
      answer: answerLabel,
      answerLabel,
      choices: makeChoices(answerLabel, distractors),
      key: `${base.topicId || ""}-${Date.now()}-${Math.random()}`
    };
  }

  function formatNumber(value) {
    return Number(value).toLocaleString("en-US");
  }

  function gradeLevel(gradeId) {
    if (gradeId.startsWith("P")) return Number(gradeId.slice(1));
    return 6 + Number(gradeId.slice(1));
  }

  function genericQuestion(topic) {
    if (topic.subjectId === "chinese") return chineseQuestion(topic);
    if (topic.subjectId === "english") return englishQuestion(topic);
    return mathQuestion(topic);
  }

  function bankQuestion(topic, entries, hint) {
    const item = sample(entries);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: topic.name,
      prompt: item[0],
      hint: item[4] || hint,
      work: item[3]
    }, item[1], item[2]);
  }

  function chineseQuestion(topic) {
    const bank = {
      primary: {
        "字詞認讀": [
          ["「安靜」的相反詞較接近哪一個？", "吵鬧", ["整齊", "明亮", "寒冷"], "安靜與吵鬧意思相反。"],
          ["「專心」較適合形容哪一種情況？", "認真做功課", ["四處奔跑", "胡亂塗寫", "大聲爭吵"], "專心表示集中精神做一件事。"],
          ["下列哪個詞語可形容天氣很好？", "晴朗", ["飢餓", "破舊", "害羞"], "晴朗通常用來形容天氣清明。"],
          ["「書包」屬於哪一類詞語？", "物件", ["動作", "顏色", "聲音"], "書包是一件可以看見和使用的物件。"]
        ],
        "閱讀理解": [
          ["「小狗在門口搖尾巴。」這句主要寫甚麼？", "小狗的動作", ["天氣", "時間", "作者心情"], "句子重點是小狗正在搖尾巴。"],
          ["「妹妹把書包放在椅子上。」誰把書包放好？", "妹妹", ["哥哥", "老師", "媽媽"], "句子的主語是妹妹。"],
          ["閱讀故事時，要知道主角遇到甚麼，應先找甚麼？", "事情經過", ["字體大小", "頁碼", "標點數量"], "故事理解要掌握人物和事情經過。"],
          ["題目問「為甚麼」，答案通常要找甚麼？", "原因", ["顏色", "數量", "稱呼"], "為甚麼是在問原因。"]
        ],
        "句子運用": [
          ["「因為下雨，____ 我帶了雨傘。」橫線應填入甚麼？", "所以", ["但是", "如果", "雖然"], "「因為……所以……」表示因果關係。"],
          ["哪一句標點較合適？", "你今天開心嗎？", ["你今天開心嗎。", "你今天開心嗎，", "你今天開心嗎、"], "問句結尾應用問號。"],
          ["「我喜歡閱讀，也喜歡畫畫。」句中的「也」表示甚麼？", "加上另一件相同方向的事", ["轉折", "原因", "比較"], "「也」表示再加一項相近內容。"],
          ["把「太陽出來了。花兒開了。」合併，哪一句較通順？", "太陽出來了，花兒也開了。", ["太陽但是花兒開了。", "花兒因為太陽嗎。", "出來了花兒太陽。"], "合併句子要保留意思並保持語序通順。"]
        ],
        "寫作表達": [
          ["寫看圖作文時，第一步最應該做甚麼？", "看清圖中人物和事情", ["先寫結尾", "只數標點", "抄題目十次"], "先觀察圖意，才知道要寫甚麼。"],
          ["寫日記時，下列哪項最常見？", "日期和當日經歷", ["收件人地址", "商品價錢", "菜單"], "日記通常記錄日期、事情和感受。"],
          ["哪一句較適合描寫心情？", "我高興得跳了起來。", ["桌子有四隻腳。", "今天是星期三。", "書包在椅子旁。"], "這句直接寫出高興的反應。"],
          ["一段短文結尾最好做到甚麼？", "收束事情或寫出感受", ["突然換成無關人物", "只寫一串數字", "完全沒有標點"], "結尾要令內容完整。"]
        ],
        "聆聽說話": [
          ["聆聽指示時，最重要先記住甚麼？", "要做的步驟", ["說話人的衣服顏色", "課室牆壁顏色", "椅子數目"], "指示的重點是行動步驟。"],
          ["同學分享時，合適的做法是甚麼？", "望著對方並安靜聆聽", ["不停插嘴", "背向對方", "大聲唱歌"], "良好聆聽要專注和尊重。"],
          ["說話匯報時，聲音應該怎樣？", "清楚而適中", ["越細越好", "含糊不清", "完全不看聽眾"], "清楚表達才容易讓人聽明白。"],
          ["想補充別人的意見，可先說甚麼？", "我想補充一點", ["你一定錯了", "我不聽", "不要再說"], "補充時應保持禮貌。"]
        ]
      },
      junior: {
        "閱讀策略": [
          ["概括一段文字時，最重要保留甚麼？", "中心意思", ["所有例子原句", "字體大小", "標點數量"], "概括要刪去枝節，保留中心。"],
          ["分析人物性格，最可靠的根據是甚麼？", "人物言行和事件", ["文章長短", "插圖顏色", "作者姓名筆畫"], "言行和事件能反映人物性格。"],
          ["閱讀議論文字時，應先找甚麼？", "論點", ["押韻字", "天氣描寫", "對話符號"], "論點是議論的核心立場。"],
          ["若題目問「作者態度」，應留意甚麼？", "用詞和評價語氣", ["頁碼", "段落數目", "字體"], "態度常由褒貶用詞和語氣反映。"]
        ],
        "文言基礎": [
          ["文言文中「曰」通常解作甚麼？", "說", ["走", "看", "吃"], "「曰」是常見文言動詞，意思是說。"],
          ["翻譯文言句子時，第一步宜怎樣？", "找出關鍵字詞", ["先改標題顏色", "只數字數", "略過主語"], "理解關鍵詞是翻譯基礎。"],
          ["「之」在文言文中可能有多種意思，判斷時要看甚麼？", "上下文", ["字體", "行距", "頁邊"], "虛詞意思要按語境判斷。"],
          ["閱讀文言故事，理解人物行動後應再想甚麼？", "行動反映的品格或道理", ["印刷紙質", "標點數目", "段落縮排"], "文言故事常借事件帶出道理。"]
        ],
        "寫作訓練": [
          ["記敘文六要素不包括哪一項？", "售價", ["人物", "時間", "地點"], "記敘文重視人物、時間、地點、起因、經過、結果。"],
          ["議論文提出例子，主要作用是甚麼？", "支持論點", ["代替標題", "增加頁數", "避開立場"], "例子要服務論點。"],
          ["描寫環境時，加入感官細節有甚麼好處？", "令畫面更具體", ["令主旨消失", "避免讀者理解", "一定減少字數"], "感官描寫能增加具體感。"],
          ["寫說明文時，語氣通常應怎樣？", "清楚客觀", ["故意含糊", "只靠誇張", "完全不用次序"], "說明文重視準確和條理。"]
        ],
        "語文知識": [
          ["「雖然……但是……」表示甚麼關係？", "轉折", ["因果", "並列", "遞進"], "雖然和但是表示前後意思有轉折。"],
          ["「他跑得像風一樣快」用了哪種修辭？", "比喻", ["排比", "設問", "反問"], "把速度比作風，是比喻。"],
          ["修改病句時，應先檢查甚麼？", "句子意思是否通順", ["字體是否漂亮", "紙張是否夠厚", "段落是否必定很長"], "病句重點是語意和語法。"],
          ["「不但……而且……」表示甚麼？", "遞進", ["選擇", "時間", "否定全部"], "後句意思通常比前句再進一步。"]
        ],
        "說話能力": [
          ["小組討論時，回應同學前應先做甚麼？", "聽清楚對方觀點", ["立即否定", "轉身離開", "只看手機"], "回應要建基於理解。"],
          ["演講開首最需要做到甚麼？", "清楚帶出主題", ["只說多謝", "沉默很久", "背向聽眾"], "開首要讓聽眾知道主題。"],
          ["匯報資料時，怎樣安排較清楚？", "先總述再分點", ["隨意跳來跳去", "只讀最後一句", "把例子全部刪去"], "有層次的安排較易理解。"],
          ["回答追問時，若需要時間思考，可以怎樣？", "先簡短確認問題", ["裝作沒聽見", "改談無關內容", "立刻離場"], "確認問題能爭取思考並保持禮貌。"]
        ]
      },
      senior: {
        "閱讀卷訓練": [
          ["比較兩篇文章觀點時，最重要先找甚麼？", "兩者的共同點和差異", ["字數是否相同", "標題顏色", "頁碼"], "比較題要同時處理相同和不同之處。"],
          ["答閱讀理解長題時，最佳做法是甚麼？", "引用文本重點再解釋", ["只寫個人喜好", "只抄題目", "完全不分段"], "高階答案要有文本根據和分析。"],
          ["分析寫作手法，答案應包含甚麼？", "手法、例子和效果", ["作者年齡", "紙張大小", "字體"], "手法題要說明效果。"],
          ["若文章語氣由輕鬆轉為沉重，反映甚麼？", "情感或主題有變化", ["必定轉換作者", "文章無主旨", "不需要理解"], "語氣變化常配合內容推進。"]
        ],
        "寫作卷訓練": [
          ["審題時，最先要確定甚麼？", "文體和題目要求", ["字體大小", "頁邊距", "墨水顏色"], "文體和要求決定內容方向。"],
          ["議論文的分論點應該怎樣？", "能支持中心論點", ["互相矛盾", "完全離題", "只重複題目"], "分論點要共同支撐中心立場。"],
          ["記敘文要寫得有層次，可重點處理甚麼？", "情節推進和人物轉變", ["只堆砌形容詞", "不交代事件", "只寫天氣"], "情節和人物變化能增加深度。"],
          ["寫作結尾最忌甚麼？", "突然加入無關新主題", ["回扣主旨", "總結感受", "呼應開首"], "結尾應收束而非另開新題。"]
        ],
        "文言閱讀": [
          ["文言文翻譯「信」時，不能只固定解作一個意思，原因是甚麼？", "一詞多義，要看語境", ["字太短", "一定是人名", "沒有句子作用"], "文言實詞常有多個義項。"],
          ["判斷文言人物形象，應結合甚麼？", "言行、處境和結果", ["印刷格式", "標題長短", "標點多少"], "人物形象要由事件證明。"],
          ["翻譯倒裝句時，應先做甚麼？", "理順現代漢語語序", ["刪去主語", "保留所有倒裝不理", "只看最後一字"], "倒裝句要按現代語序理解。"],
          ["文言虛詞題最需要留意甚麼？", "句中位置和前後關係", ["字體顏色", "行距", "頁碼"], "虛詞功能由語法位置和語境決定。"]
        ],
        "綜合能力": [
          ["整合多段材料時，最重要避免甚麼？", "逐句抄錄而不歸納", ["分點作答", "引用關鍵資料", "按任務寫作"], "綜合能力重視篩選和歸納。"],
          ["實用文寫作先要確認甚麼？", "身份、對象和目的", ["紙張品牌", "字數必定最多", "是否有插圖"], "身份、對象、目的會影響語氣和格式。"],
          ["轉述資料時，應該怎樣？", "保持原意並用清楚語句重組", ["加入無根據猜測", "故意改變數據", "只抄第一句"], "轉述要準確而有組織。"],
          ["綜合任務中，標題和小標題的作用是甚麼？", "幫助組織內容", ["取代所有正文", "令內容離題", "只作裝飾"], "標題可提示層次。"]
        ],
        "口語溝通": [
          ["小組討論要有說服力，發言應包括甚麼？", "立場、理由和例子", ["只重複同一句", "完全不回應他人", "只說不知道"], "有理據才有說服力。"],
          ["回應反方意見時，較成熟的做法是甚麼？", "先承認合理部分再提出補充", ["人身攻擊", "立即大叫", "離開座位"], "理性回應能提升討論質素。"],
          ["個人短講結尾應怎樣？", "總結重點並扣回主題", ["突然停止", "加入無關故事", "只說再見"], "結尾要令內容完整。"],
          ["討論時若資料不足，應怎樣表達？", "說明限制並提出可行推論", ["假裝肯定", "完全沉默", "改談娛樂"], "承認限制比亂猜更可靠。"]
        ]
      }
    };
    const band = gradeBand(topic.gradeId);
    const entries = bank[band][topic.name] || Object.values(bank[band])[0];
    return bankQuestion(topic, entries, "先找題目關鍵詞，再判斷它問的是內容、語文知識還是表達方法。");
  }

  function englishQuestion(topic) {
    const bank = {
      primary: {
        "Vocabulary": [
          ["Choose the word that means very small.", "tiny", ["huge", "loud", "late"], "Tiny means very small."],
          ["Which word is a place?", "library", ["happy", "quickly", "jump"], "A library is a place where people read or borrow books."],
          ["Choose the opposite of cold.", "hot", ["slow", "short", "quiet"], "Hot is the opposite of cold."],
          ["Which word names an animal?", "rabbit", ["window", "purple", "write"], "A rabbit is an animal."]
        ],
        "Grammar": [
          ["Choose the correct word: She ____ to school every day.", "goes", ["go", "going", "went"], "For he/she/it in the simple present tense, add -s or -es: she goes."],
          ["Choose the correct pronoun: Tom is my friend. ____ is kind.", "He", ["She", "It", "They"], "Tom is one boy, so use he."],
          ["Choose the correct preposition: The cat is ____ the table.", "under", ["happy", "run", "blue"], "Under tells where the cat is."],
          ["Choose the correct past tense: We ____ football yesterday.", "played", ["play", "plays", "playing"], "Yesterday shows past time, so use played."]
        ],
        "Reading": [
          ["A text says, \"Mia packed an umbrella because dark clouds filled the sky.\" Why did Mia pack an umbrella?", "She thought it might rain.", ["She was hungry.", "She lost her bag.", "She wanted to swim."], "Dark clouds suggest rain."],
          ["What is the main idea of a paragraph?", "The most important point", ["Only the last word", "A punctuation mark", "The page number"], "The main idea is what the paragraph is mostly about."],
          ["If a story says Ben smiled and clapped, how does Ben probably feel?", "happy", ["angry", "sleepy", "afraid"], "Smiling and clapping usually show happiness."],
          ["Which detail answers \"where\"?", "in the playground", ["after lunch", "because it rained", "very slowly"], "Where asks for a place."]
        ],
        "Writing": [
          ["Which sentence has a capital letter and a full stop?", "I like apples.", ["i like apples", "I like apples", "i like apples."], "A sentence starts with a capital letter and ends with punctuation."],
          ["Which sentence is best for describing a pet?", "My dog has soft brown fur.", ["The bus is late.", "I do homework.", "It is Tuesday."], "The sentence gives details about a dog."],
          ["What should a short story have?", "A beginning, middle and ending", ["Only a title", "Only one word", "No characters"], "A clear story has a basic sequence."],
          ["Which word can join two ideas?", "and", ["table", "green", "seven"], "And joins related ideas."]
        ],
        "Speaking & Listening": [
          ["What should you do when listening to instructions?", "Listen for the steps", ["Talk loudly", "Look away", "Ignore keywords"], "Instructions tell you what to do step by step."],
          ["Choose the best reply: Thank you.", "You're welcome.", ["I am seven.", "It is under the chair.", "Blue."], "You're welcome is a polite reply to thank you."],
          ["When giving a short presentation, your voice should be ____.", "clear", ["silent", "unclear", "hidden"], "A clear voice helps listeners understand."],
          ["In a conversation, what should you do before answering?", "Listen to the question", ["Walk away", "Cover your ears", "Change topic immediately"], "Listening helps you answer correctly."]
        ]
      },
      junior: {
        "Vocabulary": [
          ["Choose the best word: The instructions were clear and easy to follow.", "clear", ["ancient", "noisy", "round"], "Clear means easy to understand."],
          ["Which word is closest in meaning to \"rapid\"?", "fast", ["empty", "kind", "weak"], "Rapid means fast."],
          ["Choose the correct collocation.", "make a decision", ["do a decision", "take a homework", "make a shower"], "We say make a decision."],
          ["Use context: The room was spotless; there was no dust anywhere. What does spotless mean?", "very clean", ["very dark", "very small", "very noisy"], "No dust anywhere shows the room was very clean."]
        ],
        "Grammar": [
          ["Choose the correct tense: I ____ my homework before dinner yesterday.", "finished", ["finish", "finishes", "will finish"], "Yesterday shows the past tense."],
          ["Choose the correct modal: Students ____ bring their handbook tomorrow.", "must", ["yesterday", "under", "quickly"], "Must expresses an obligation."],
          ["Choose the correct reported speech: She said, \"I am tired.\"", "She said that she was tired.", ["She said that I am tired.", "She says tired.", "She said tiredly tomorrow."], "Reported speech usually shifts am to was in past reporting."],
          ["Choose the correct relative pronoun: This is the book ____ I borrowed.", "that", ["who", "when", "where"], "That can refer to a thing."]
        ],
        "Reading Skills": [
          ["What is skimming mainly used for?", "Getting the general idea quickly", ["Checking every spelling", "Counting commas", "Memorising one sentence"], "Skimming helps you understand the gist."],
          ["What is scanning mainly used for?", "Finding specific information", ["Reading every word slowly", "Guessing the ending", "Writing a summary"], "Scanning helps locate names, dates or figures."],
          ["What is the main purpose of a topic sentence?", "To show the main idea of a paragraph", ["To end the whole essay", "To list every example", "To replace punctuation"], "A topic sentence guides the paragraph."],
          ["If a writer uses words like \"unfortunately\" and \"worrying\", what can they show?", "A negative attitude", ["A recipe", "A timetable", "A direct quote only"], "These words signal concern or negativity."]
        ],
        "Writing Skills": [
          ["Which connector shows contrast?", "however", ["because", "therefore", "firstly"], "However introduces a contrasting idea."],
          ["Which sentence is most suitable for a formal email opening?", "I am writing to enquire about the course.", ["Hey, what's up?", "Yo, tell me now.", "This thing is cool."], "Formal emails use polite and precise language."],
          ["What makes a paragraph cohesive?", "Ideas are linked clearly", ["Every sentence changes topic", "No pronouns are used ever", "All examples are removed"], "Cohesion means ideas connect smoothly."],
          ["Which is the best concluding sentence?", "Therefore, regular reading can improve vocabulary.", ["And then blue.", "My first point is next.", "Because of table."], "A conclusion should sum up the idea."]
        ],
        "Oral Communication": [
          ["In a group discussion, what should you do after giving an opinion?", "Support it with a reason", ["Stop others from speaking", "Repeat one word", "Leave the group"], "Reasons make opinions stronger."],
          ["Which phrase politely disagrees?", "I see your point, but I think...", ["You are silly.", "Stop talking.", "No one cares."], "Polite disagreement respects others."],
          ["What helps a presentation sound organized?", "Signposting words such as first and finally", ["Speaking with no order", "Avoiding all examples", "Reading only the title"], "Signposting guides listeners."],
          ["When you do not understand a question, what can you say?", "Could you repeat the question, please?", ["I will ignore you.", "That is your problem.", "Never mind forever."], "Asking for repetition is appropriate."]
        ]
      },
      senior: {
        "Reading Paper": [
          ["In reading comprehension, evidence-based answers should include what?", "Relevant textual support", ["Only personal feelings", "A copied title only", "Random examples"], "Evidence from the text supports the answer."],
          ["What does \"tone\" refer to in a passage?", "The writer's attitude or feeling", ["The number of lines", "The font size", "The paper colour"], "Tone is shown through word choice and style."],
          ["When comparing two views, what should an answer identify?", "Similarities and differences", ["Only the shorter text", "Only punctuation", "The writer's birthday"], "Comparison requires both sides."],
          ["If a question asks for purpose, what should you explain?", "Why the writer includes that detail", ["How many letters it has", "Whether it is printed in bold", "The page margin"], "Purpose concerns the function of the detail."]
        ],
        "Writing Paper": [
          ["Which phrase is most suitable for a formal argumentative essay?", "It can be argued that", ["You know what", "Loads of people say", "This is super cool"], "Formal writing avoids casual speech."],
          ["What should a thesis statement do?", "State the main argument clearly", ["List random words", "Avoid any position", "Replace all examples"], "A thesis sets the direction of an essay."],
          ["Which feature is important in a proposal?", "Practical recommendations", ["Only jokes", "No headings ever", "Unrelated stories"], "A proposal should suggest workable actions."],
          ["What does register mean in writing?", "The level of formality and language choice", ["The number of pages", "The ink colour", "The paragraph width"], "Register must match audience and purpose."]
        ],
        "Vocabulary & Usage": [
          ["Choose the more precise verb: The report ____ several causes of the problem.", "identifies", ["does", "gets", "makes"], "Identifies precisely means points out or recognizes."],
          ["Which phrase is most academic?", "a significant increase", ["a big big rise", "loads more", "super much"], "Academic writing uses precise wording."],
          ["Choose the correct collocation.", "pose a challenge", ["make a challenge to the floor", "do a challenge strongly", "give a challenge of rain"], "Pose a challenge is a standard collocation."],
          ["Which word best replaces \"bad\" in \"a bad effect\"?", "harmful", ["round", "sleepy", "wooden"], "Harmful is more precise than bad."]
        ],
        "Listening & Integrated Skills": [
          ["In an integrated task, notes should mainly capture what?", "Key points and task requirements", ["Every filler word", "Speaker's hairstyle", "Background colour"], "Good notes focus on usable information."],
          ["When transferring data from a chart, what is most important?", "Accuracy", ["Changing the numbers", "Adding guesses", "Ignoring labels"], "Data transfer must preserve correct information."],
          ["What should a synthesis do?", "Combine relevant information from sources", ["Copy one source only", "Avoid the task", "Invent statistics"], "Synthesis brings together relevant points."],
          ["If two sources disagree, what should you do?", "Show the contrast clearly", ["Pretend they are identical", "Delete both sources", "Use neither forever"], "Integrated answers should handle conflicting information."]
        ],
        "Speaking": [
          ["In a speaking exam, an extended answer should include what?", "Point, reason and example", ["One word only", "No explanation", "A private joke"], "A developed answer needs support."],
          ["How can you build on another speaker's point?", "Add a related reason or example", ["Ignore it completely", "Repeat it word for word only", "Change to an unrelated topic"], "Building on ideas improves interaction."],
          ["Which phrase helps you invite another view?", "What do you think about this?", ["Stop speaking.", "I refuse to listen.", "Only I can answer."], "Inviting views supports group interaction."],
          ["If challenged, what is a strong response?", "Clarify your point with evidence", ["Get angry", "Say nothing ever", "Attack the person"], "Evidence-based clarification is persuasive."]
        ]
      }
    };
    const band = gradeBand(topic.gradeId);
    const entries = bank[band][topic.name] || Object.values(bank[band])[0];
    return bankQuestion(topic, entries, "Look at the keywords and decide the grammar, meaning or text purpose.");
  }

  function mathQuestion(topic) {
    const level = gradeLevel(topic.gradeId);
    if (topic.name.includes("數與運算")) return mathNumberQuestion(topic, level);
    if (topic.name.includes("分數") || topic.name.includes("小數")) return mathFractionDecimalQuestion(topic, level);
    if (topic.name === "度量" || topic.name.includes("度量與幾何")) return mathMeasurementQuestion(topic, level);
    if (topic.name.includes("圖形")) return mathShapeQuestion(topic, level);
    if (topic.name.includes("數據")) return mathDataQuestion(topic, level);
    if (topic.name.includes("數與代數")) return mathAlgebraQuestion(topic, level);
    if (topic.name.includes("函數")) return mathFunctionQuestion(topic, level);
    if (topic.name.includes("坐標")) return mathCoordinateQuestion(topic, level);
    if (topic.name.includes("微積分")) return mathCalculusQuestion(topic);
    if (topic.name.includes("統計")) return mathSeniorStatsQuestion(topic);
    return mathNumberQuestion(topic, level);
  }

  function mathNumberQuestion(topic, level) {
    if (level <= 3) {
      const a = randInt(8, 80);
      const b = randInt(3, 40);
      const result = a + b;
      return makeChoiceQuestion({
        topicId: topic.id,
        title: topic.name,
        prompt: `${a} + ${b} = ?`,
        hint: "先加個位，再加十位。",
        work: `${a} + ${b} = ${result}。`
      }, String(result), [String(result + 1), String(Math.max(1, result - 1)), String(Math.abs(a - b))]);
    }
    const a = randInt(12, 99);
    const b = randInt(3, 12);
    const result = a * b;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: topic.name,
      prompt: `${a} × ${b} = ?`,
      hint: "可把較大的數拆開，例如十位和個位分開乘。",
      work: `${a} × ${b} = ${result}。`
    }, String(result), [String(result + b), String(Math.max(1, result - b)), String(a + b)]);
  }

  function mathFractionDecimalQuestion(topic, level) {
    const d = sample([4, 5, 8, 10]);
    const n = randInt(1, d - 1);
    if (level <= 3) {
      return makeChoiceQuestion({
        topicId: topic.id,
        title: topic.name,
        prompt: `一個薄餅平均分成 ${d} 份，吃了 ${n} 份，即是全個的幾分之幾？`,
        hint: "分母是平均分成的份數，分子是取了的份數。",
        work: `平均分成 ${d} 份，取 ${n} 份，所以是 ${n}/${d}。`
      }, `${n}/${d}`, [`${d}/${n}`, `${n}/${d + 1}`, `${Math.max(1, n - 1)}/${d}`]);
    }
    const decimal = n / d;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: topic.name,
      prompt: `${n}/${d} 化成小數是多少？`,
      hint: "用分子除以分母。",
      work: `${n} ÷ ${d} = ${cleanDecimal(decimal)}。`
    }, String(cleanDecimal(decimal)), [String(cleanDecimal(decimal + 0.1)), String(cleanDecimal(decimal * 10)), `${n}.${d}`]);
  }

  function mathMeasurementQuestion(topic, level) {
    if (level <= 6) {
      const length = randInt(6, 18);
      const width = randInt(3, 12);
      const perimeter = 2 * (length + width);
      return makeChoiceQuestion({
        topicId: topic.id,
        title: topic.name,
        prompt: `一個長方形長 ${length} cm，闊 ${width} cm，周界是多少？`,
        hint: "長方形周界 = (長 + 闊) × 2。",
        work: `(${length} + ${width}) × 2 = ${perimeter} cm。`
      }, String(perimeter), [String(length * width), String(length + width), String(perimeter + 2)]);
    }
    const a = randInt(5, 13);
    const b = randInt(4, 12);
    const c2 = a * a + b * b;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: topic.name,
      prompt: `一直角三角形兩條直角邊長 ${a} cm 和 ${b} cm，斜邊長的平方是多少？`,
      hint: "畢氏定理：斜邊平方 = 兩直角邊平方和。",
      work: `${a}² + ${b}² = ${a * a} + ${b * b} = ${c2}。`
    }, String(c2), [String(a + b), String(a * b), String(c2 - a)]);
  }

  function mathShapeQuestion(topic, level) {
    if (level <= 6) {
      const sides = sample([3, 4, 5, 6, 8]);
      return makeChoiceQuestion({
        topicId: topic.id,
        title: topic.name,
        prompt: `一個 ${sides} 邊形有多少條邊？`,
        hint: "幾邊形就有幾條邊。",
        work: `${sides} 邊形有 ${sides} 條邊。`
      }, String(sides), [String(sides + 1), String(Math.max(1, sides - 1)), String(sides * 2)]);
    }
    const angle = randInt(35, 75);
    const other = 90 - angle;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: topic.name,
      prompt: `一直角三角形其中一個銳角是 ${angle}°，另一個銳角是多少？`,
      hint: "直角三角形兩個銳角相加是 90°。",
      work: `90° - ${angle}° = ${other}°。`
    }, `${other}°`, [`${angle}°`, `${180 - angle}°`, `${other + 10}°`]);
  }

  function mathDataQuestion(topic, level) {
    const values = level <= 6
      ? [randInt(4, 12), randInt(4, 12), randInt(4, 12)]
      : [randInt(12, 30), randInt(12, 30), randInt(12, 30), randInt(12, 30)];
    const total = values.reduce((sum, item) => sum + item, 0);
    const average = cleanDecimal(total / values.length);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: topic.name,
      prompt: `數據為 ${values.join("、")}，平均數是多少？`,
      hint: "平均數 = 總和 ÷ 數據個數。",
      work: `(${values.join(" + ")}) ÷ ${values.length} = ${average}。`
    }, String(average), [String(total), String(cleanDecimal(average + 1)), String(values.length)]);
  }

  function mathAlgebraQuestion(topic, level) {
    const x = randInt(2, 12);
    const a = randInt(2, 8);
    const b = randInt(3, 20);
    const total = a * x + b;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: topic.name,
      prompt: `解方程：${a}x + ${b} = ${total}`,
      hint: "先減常數項，再除以 x 的係數。",
      work: `${a}x = ${total - b}，x = ${x}。`
    }, String(x), [String(x + 1), String(Math.max(1, x - 1)), String(total)]);
  }

  function mathFunctionQuestion(topic, level) {
    const m = randInt(2, 8);
    const c = randInt(-6, 8);
    const x = randInt(1, 8);
    const y = m * x + c;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: topic.name,
      prompt: `若 f(x) = ${m}x ${c >= 0 ? "+" : "-"} ${Math.abs(c)}，求 f(${x})。`,
      hint: `把 x 換成 ${x}，再按次序計算。`,
      work: `f(${x}) = ${m} × ${x} ${c >= 0 ? "+" : "-"} ${Math.abs(c)} = ${y}。`
    }, String(y), [String(y + m), String(y - m), String(m + x + c)]);
  }

  function mathCoordinateQuestion(topic) {
    const x1 = randInt(-5, 5);
    const y1 = randInt(-5, 5);
    const dx = randInt(2, 8);
    const x2 = x1 + dx;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: topic.name,
      prompt: `點 A(${x1}, ${y1}) 和 B(${x2}, ${y1}) 的距離是多少？`,
      hint: "兩點 y 坐標相同，距離是 x 坐標相差的絕對值。",
      work: `|${x2} - (${x1})| = ${dx}。`
    }, String(dx), [String(Math.abs(x1 + x2)), String(dx + 1), String(Math.abs(y1))]);
  }

  function mathCalculusQuestion(topic) {
    const a = randInt(2, 7);
    const b = randInt(1, 9);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: topic.name,
      prompt: `若 f(x) = ${a}x² + ${b}x，f'(x) 是甚麼？`,
      hint: "x² 的導數是 2x，x 的導數是 1。",
      work: `f'(x) = ${2 * a}x + ${b}。`
    }, `${2 * a}x + ${b}`, [`${a}x + ${b}`, `${2 * a}x² + ${b}`, `${a}x² + ${b}`]);
  }

  function mathSeniorStatsQuestion(topic) {
    const red = randInt(2, 6);
    const blue = randInt(3, 8);
    const total = red + blue;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: topic.name,
      prompt: `袋中有 ${red} 個紅球和 ${blue} 個藍球，隨機抽一球，抽到紅球的概率是多少？`,
      hint: "概率 = 符合條件的數量 ÷ 總數量。",
      work: `紅球 ${red} 個，總數 ${total} 個，所以概率是 ${red}/${total}。`
    }, `${red}/${total}`, [`${blue}/${total}`, `${red}/${blue}`, `${total}/${red}`]);
  }

  function largeNumberCompare(topic) {
    const numbers = Array.from({ length: 4 }, () => randInt(1000000, 999999999));
    const largest = Math.max(...numbers);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "比較多位數",
      prompt: `以下邊一個數最大？`,
      hint: "由最高位開始比較；最高位相同，先比較下一位。",
      work: `四個數由最高位比較，最大的是 ${formatNumber(largest)}。`
    }, formatNumber(largest), numbers.filter((n) => n !== largest).map(formatNumber));
  }

  function largeNumberRound(topic) {
    const units = [
      ["千位", 1000],
      ["萬位", 10000],
      ["十萬位", 100000],
      ["百萬位", 1000000],
      ["千萬位", 10000000],
      ["億位", 100000000]
    ];
    const [unitName, unit] = sample(units);
    const number = randInt(1000000, 987654321);
    const rounded = Math.round(number / unit) * unit;
    const distractors = [Math.floor(number / unit) * unit, Math.ceil(number / unit) * unit, rounded + unit, rounded - unit]
      .filter((item) => item > 0)
      .map(formatNumber);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "四捨五入取近似值",
      prompt: `把 ${formatNumber(number)} 取近似值至最接近的${unitName}。`,
      hint: `先找${unitName}，再看右邊一位是否 5 或以上。`,
      work: `${formatNumber(number)} 取近似值至最接近的${unitName}是 ${formatNumber(rounded)}。`
    }, formatNumber(rounded), distractors);
  }

  function oddEvenLarge(topic) {
    const number = randInt(100000, 99999999);
    const answer = number % 2 === 0 ? "偶數" : "奇數";
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "奇數和偶數",
      prompt: `${formatNumber(number)} 是奇數還是偶數？`,
      hint: "只需要看個位數字。",
      work: `${formatNumber(number)} 的個位是 ${number % 10}，所以是${answer}。`
    }, answer, [answer === "偶數" ? "奇數" : "偶數"]);
  }

  function randomProperFraction(maxD = 12) {
    const d = randInt(3, maxD);
    const n = randInt(1, d - 1);
    return frac(n, d);
  }

  function fractionCompare(topic) {
    const values = shuffle([randomProperFraction(), randomProperFraction(), randomProperFraction()]);
    values.sort((a, b) => compareFrac(a, b));
    const largest = values[2];
    const labels = shuffle(values.map(formatFrac));
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "比較異分母分數",
      prompt: `以下邊一個分數最大？ ${labels.join("、")}`,
      hint: "把分數化成同分母，再比較分子。",
      work: `通分後比較，最大的是 ${formatFracHtml(largest)}。`
    }, formatFrac(largest), labels.filter((label) => label !== formatFrac(largest)));
  }

  function fractionAddSub(topic) {
    const a = randomProperFraction();
    const b = randomProperFraction();
    const op = sample(["+", "-"]);
    const first = compareFrac(a, b) >= 0 ? a : b;
    const second = compareFrac(a, b) >= 0 ? b : a;
    const result = op === "+" ? addFrac(a, b) : subFrac(first, second);
    const prompt = op === "+"
      ? `${formatFrac(a)} + ${formatFrac(b)} = ?`
      : `${formatFrac(first)} - ${formatFrac(second)} = ?`;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "異分母分數加減",
      prompt,
      hint: "先找兩個分母的最小公倍數，通分後才加減分子。",
      work: `通分後計算，答案是 ${formatFracHtml(result)}。`
    }, formatFrac(result), [
      formatFrac(frac(result.n + 1, result.d)),
      formatFrac(frac(Math.max(1, result.n - 1), result.d)),
      formatFrac(frac(first.n + second.n, first.d + second.d))
    ]);
  }

  function fractionWordAddSub(topic) {
    const a = randomProperFraction();
    const b = randomProperFraction();
    const result = addFrac(a, b);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "分數應用題",
      prompt: `一條絲帶，上午用了全條的 ${formatFrac(a)}，下午用了全條的 ${formatFrac(b)}。兩次合共用了全條的幾分之幾？`,
      hint: "同一條絲帶的部分相加，用分數加法。",
      work: `${formatFrac(a)} + ${formatFrac(b)} = ${formatFracHtml(result)}。`
    }, formatFrac(result), [
      formatFrac(subFrac(result, frac(1, lcm(a.d, b.d)))),
      formatFrac(frac(a.n + b.n, a.d + b.d)),
      formatFrac(frac(result.n + 1, result.d))
    ]);
  }

  function fractionMultiply(topic) {
    const a = randomProperFraction();
    const b = randomProperFraction();
    const c = randInt(2, 9);
    const useThree = Math.random() > 0.45;
    const result = useThree ? mulFrac(mulFrac(a, b), frac(c, 1)) : mulFrac(a, frac(c, 1));
    const prompt = useThree
      ? `${formatFrac(a)} × ${formatFrac(b)} × ${c} = ?`
      : `${formatFrac(a)} × ${c} = ?`;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "分數乘法",
      prompt,
      hint: "分子乘分子，分母乘分母；整數可看成分母為 1 的分數。",
      work: `約簡後，答案是 ${formatFracHtml(result)}。`
    }, formatFrac(result), [
      formatFrac(frac(result.n + 1, result.d)),
      formatFrac(frac(result.n, result.d + 1)),
      formatFrac(frac(Math.max(1, result.n - 1), result.d))
    ]);
  }

  function fractionPartOf(topic) {
    const d = randInt(3, 10);
    const n = randInt(1, d - 1);
    const total = d * randInt(3, 12);
    const result = total * n / d;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "求一個數的幾分之幾",
      prompt: `班上有 ${total} 人，其中 ${n}/${d} 參加數學遊戲。參加的人數是多少？`,
      hint: `求 ${total} 的 ${n}/${d}，即 ${total} × ${n}/${d}。`,
      work: `${total} × ${n}/${d} = ${result}，所以有 ${result} 人。`
    }, String(result), [String(result + d), String(Math.max(1, result - n)), String(total - result)]);
  }

  function decimalScaleMultiply(topic) {
    const value = Number((randInt(12, 999) / 10).toFixed(1));
    const factor = sample([10, 100, 1000, 0.1, 0.01, 0.001]);
    const result = cleanDecimal(value * factor);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "小數乘 10、100、1000",
      prompt: `${value} × ${factor} = ?`,
      hint: "乘 10、100、1000，小數點向右移；乘 0.1、0.01、0.001，小數點向左移。",
      work: `${value} × ${factor} = ${result}。`
    }, String(result), [
      String(cleanDecimal(result * 10)),
      String(cleanDecimal(result / 10)),
      String(cleanDecimal(value + factor))
    ]);
  }

  function decimalMultiply(topic) {
    const a = Number((randInt(12, 99) / 10).toFixed(1));
    const b = Number((randInt(11, 99) / 10).toFixed(1));
    const result = cleanDecimal(a * b);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "小數乘法",
      prompt: `${a} × ${b} = ?`,
      hint: "先當整數相乘，再按兩個因數合共的小數位放回小數點。",
      work: `${a} × ${b} = ${result}。`
    }, String(result), [
      String(cleanDecimal(result + 1)),
      String(cleanDecimal(result / 10)),
      String(cleanDecimal(a + b))
    ]);
  }

  function decimalWord(topic) {
    const price = Number((randInt(35, 180) / 10).toFixed(1));
    const count = randInt(3, 9);
    const result = cleanDecimal(price * count);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "小數乘法應用題",
      prompt: `一本筆記簿售 $${price}，買 ${count} 本共需多少元？`,
      hint: "單價 × 數量 = 總價。",
      work: `$${price} × ${count} = $${result}。`
    }, String(result), [String(cleanDecimal(result + price)), String(cleanDecimal(result - price)), String(cleanDecimal(price + count))]);
  }

  function cleanDecimal(value) {
    return Number(Number(value).toFixed(6));
  }

  function fractionDivide(topic) {
    const a = frac(randInt(2, 8), randInt(3, 10));
    const b = sample([frac(randInt(2, 8), 1), randomProperFraction()]);
    const result = divFrac(a, b);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "分數除法",
      prompt: `${formatFrac(a)} ÷ ${formatFrac(b)} = ?`,
      hint: "除以一個數，等於乘以它的倒數。",
      work: `${formatFrac(a)} ÷ ${formatFrac(b)} = ${formatFrac(a)} × ${formatFrac(frac(b.d, b.n))} = ${formatFracHtml(result)}。`
    }, formatFrac(result), [
      formatFrac(mulFrac(a, b)),
      formatFrac(frac(result.n + 1, result.d)),
      formatFrac(frac(result.n, result.d + 1))
    ]);
  }

  function fractionMixed(topic) {
    const a = randomProperFraction();
    const b = randomProperFraction();
    const c = randInt(2, 5);
    const result = addFrac(mulFrac(a, frac(c, 1)), b);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "分數四則混合",
      prompt: `${formatFrac(a)} × ${c} + ${formatFrac(b)} = ?`,
      hint: "先乘除，後加減；加減前記得通分。",
      work: `先計 ${formatFrac(a)} × ${c}，再加 ${formatFrac(b)}，答案是 ${formatFracHtml(result)}。`
    }, formatFrac(result), [
      formatFrac(addFrac(a, mulFrac(b, frac(c, 1)))),
      formatFrac(mulFrac(addFrac(a, b), frac(c, 1))),
      formatFrac(frac(result.n + 1, result.d))
    ]);
  }

  function unitaryFraction(topic) {
    const boxes = randInt(3, 8);
    const perBox = randInt(4, 9);
    const target = randInt(2, 6);
    const total = boxes * perBox;
    const result = perBox * target;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "歸一法應用題",
      prompt: `${boxes} 盒餅乾共有 ${total} 塊。照這個比例，${target} 盒共有多少塊？`,
      hint: "先求 1 盒有多少塊，再乘目標盒數。",
      work: `${total} ÷ ${boxes} = ${perBox}，${perBox} × ${target} = ${result}。`
    }, String(result), [String(total + target), String(total - result), String(perBox + target)]);
  }

  function algebraExpression(topic) {
    const cases = [
      {
        prompt: "小明有 x 枚貼紙，姐姐比他多 8 枚。姐姐有多少枚貼紙？",
        answer: "x + 8",
        distractors: ["x - 8", "8x", "x ÷ 8"],
        work: "「比他多 8」即在 x 上加 8，所以是 x + 8。"
      },
      {
        prompt: "一盒彩筆有 x 枝，5 盒共有多少枝？",
        answer: "5x",
        distractors: ["x + 5", "x - 5", "x ÷ 5"],
        work: "5 盒即 5 個 x，相當於 5 × x，記作 5x。"
      },
      {
        prompt: "x 個蘋果平均分給 4 人，每人有多少個？",
        answer: "x ÷ 4",
        distractors: ["x + 4", "4x", "x - 4"],
        work: "平均分給 4 人，即 x ÷ 4。"
      }
    ];
    const item = sample(cases);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "寫代數式",
      prompt: item.prompt,
      hint: "先找未知量，再把文字中的加、減、乘、除關係寫出來。",
      work: item.work
    }, item.answer, item.distractors);
  }

  function algebraEvaluate(topic) {
    const x = randInt(2, 12);
    const a = randInt(2, 9);
    const b = randInt(3, 20);
    const result = a * x + b;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "代入數值",
      prompt: `若 x = ${x}，求 ${a}x + ${b} 的值。`,
      hint: `先把 x 換成 ${x}，再按先乘後加計算。`,
      work: `${a}x + ${b} = ${a} × ${x} + ${b} = ${result}。`
    }, String(result), [String(a + x + b), String(a * (x + b)), String(result - b)]);
  }

  function simpleEquation(topic) {
    const type = randInt(1, 8);
    const x = randInt(6, 18);
    const a = randInt(2, 9);
    const b = randInt(2, Math.min(15, x - 1));
    let equation;
    let work;
    switch (type) {
      case 1:
        equation = `x + ${b} = ${x + b}`;
        work = `x = ${x + b} - ${b} = ${x}。`;
        break;
      case 2:
        equation = `x - ${b} = ${x - b}`;
        work = `x = ${x - b} + ${b} = ${x}。`;
        break;
      case 3:
        equation = `${a}x = ${a * x}`;
        work = `x = ${a * x} ÷ ${a} = ${x}。`;
        break;
      case 4:
        equation = `x ÷ ${a} = ${x}`;
        work = `x = ${x} × ${a} = ${x * a}。`;
        return makeChoiceQuestion({
          topicId: topic.id,
          title: "解簡易方程",
          prompt: `解方程：${equation}`,
          hint: "用相反運算令 x 單獨在一邊。",
          work
        }, String(x * a), [String(x), String(x + a), String(Math.max(1, x * a - a))]);
      case 5:
        equation = `${a}x + ${b} = ${a * x + b}`;
        work = `先減 ${b}：${a}x = ${a * x}，再除以 ${a}，x = ${x}。`;
        break;
      case 6:
        equation = `${a}x - ${b} = ${a * x - b}`;
        work = `先加 ${b}：${a}x = ${a * x}，再除以 ${a}，x = ${x}。`;
        break;
      case 7:
        equation = `x ÷ ${a} + ${b} = ${x + b}`;
        work = `先減 ${b}：x ÷ ${a} = ${x}，再乘 ${a}，x = ${x * a}。`;
        return makeChoiceQuestion({
          topicId: topic.id,
          title: "解簡易方程",
          prompt: `解方程：${equation}`,
          hint: "先處理加減，再處理乘除。",
          work
        }, String(x * a), [String(x), String(x + b), String(x * a + b)]);
      default:
        equation = `x ÷ ${a} - ${b} = ${x - b}`;
        work = `先加 ${b}：x ÷ ${a} = ${x}，再乘 ${a}，x = ${x * a}。`;
        return makeChoiceQuestion({
          topicId: topic.id,
          title: "解簡易方程",
          prompt: `解方程：${equation}`,
          hint: "先處理加減，再處理乘除。",
          work
        }, String(x * a), [String(x), String(x - b), String(x * a - b)]);
    }
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "解簡易方程",
      prompt: `解方程：${equation}`,
      hint: "用相反運算令 x 單獨在一邊。",
      work
    }, String(x), [String(x + 1), String(Math.max(1, x - 1)), String(a * x)]);
  }

  function equationWord(topic) {
    const x = randInt(5, 20);
    const b = randInt(3, 15);
    const total = x + b;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "方程應用題",
      prompt: `小晴有 x 元，媽媽再給她 ${b} 元後共有 ${total} 元。x 是多少？`,
      hint: `根據題意可列方程 x + ${b} = ${total}。`,
      work: `x + ${b} = ${total}，所以 x = ${total} - ${b} = ${x}。`
    }, String(x), [String(total), String(b), String(total + b)]);
  }

  function areaParallelogram(topic) {
    const base = randInt(6, 16);
    const height = randInt(4, 12);
    const result = base * height;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "平行四邊形面積",
      prompt: `下圖平行四邊形的底是 ${base} cm，高是 ${height} cm，面積是多少？`,
      diagram: shapeDiagram("parallelogram", { base, height }),
      hint: "平行四邊形面積 = 底 × 高。",
      work: `${base} × ${height} = ${result} cm²。`
    }, String(result), [String(base + height), String(result / 2), String(result + base)]);
  }

  function areaTriangleTrapezium(topic) {
    const isTriangle = Math.random() > 0.5;
    if (isTriangle) {
      const base = randInt(8, 20);
      const height = randInt(4, 14);
      const result = base * height / 2;
      return makeChoiceQuestion({
        topicId: topic.id,
        title: "三角形面積",
        prompt: `下圖三角形的底是 ${base} cm，高是 ${height} cm，面積是多少？`,
        diagram: shapeDiagram("triangle", { base, height }),
        hint: "三角形面積 = 底 × 高 ÷ 2。",
        work: `${base} × ${height} ÷ 2 = ${result} cm²。`
      }, String(result), [String(base * height), String(base + height), String(result + height)]);
    }
    const top = randInt(4, 11);
    const bottom = top + randInt(3, 9);
    const height = randInt(4, 12);
    const result = (top + bottom) * height / 2;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "梯形面積",
      prompt: `下圖梯形的上底是 ${top} cm，下底是 ${bottom} cm，高是 ${height} cm，面積是多少？`,
      diagram: shapeDiagram("trapezium", { top, bottom, height }),
      hint: "梯形面積 = (上底 + 下底) × 高 ÷ 2。",
      work: `(${top} + ${bottom}) × ${height} ÷ 2 = ${result} cm²。`
    }, String(result), [String((top + bottom) * height), String(top * bottom), String(result + height)]);
  }

  function areaComposite(topic) {
    const width = randInt(6, 14);
    const height = randInt(5, 12);
    const triBase = randInt(4, 10);
    const triHeight = height;
    const result = width * height + triBase * triHeight / 2;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "組合圖形面積",
      prompt: `一個長方形（${width} cm × ${height} cm）旁邊接上一個底 ${triBase} cm、高 ${triHeight} cm 的三角形，總面積是多少？`,
      diagram: shapeDiagram("composite", { width, height, triBase, triHeight }),
      hint: "先分成長方形和三角形，分別求面積後相加。",
      work: `長方形：${width} × ${height} = ${width * height}；三角形：${triBase} × ${triHeight} ÷ 2 = ${triBase * triHeight / 2}；合共 ${result} cm²。`
    }, String(result), [String(width * height), String(triBase * triHeight), String(result + width)]);
  }

  function shapeDiagram(kind, data) {
    const label = (text, x, y) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="14" fill="#1d252c">${text}</text>`;
    let svg = "";
    if (kind === "parallelogram") {
      svg = `
        <polygon points="90,35 280,35 230,135 40,135" fill="#e8f5ec" stroke="#287a58" stroke-width="3"></polygon>
        <line x1="230" y1="35" x2="230" y2="135" stroke="#b76518" stroke-width="3" stroke-dasharray="6 5"></line>
        ${label(`${data.base} cm`, 150, 158)}
        ${label(`${data.height} cm`, 260, 90)}
      `;
    } else if (kind === "triangle") {
      svg = `
        <polygon points="65,135 285,135 170,35" fill="#e8f1f7" stroke="#2e638b" stroke-width="3"></polygon>
        <line x1="170" y1="35" x2="170" y2="135" stroke="#b76518" stroke-width="3" stroke-dasharray="6 5"></line>
        ${label(`${data.base} cm`, 175, 158)}
        ${label(`${data.height} cm`, 205, 90)}
      `;
    } else if (kind === "trapezium") {
      svg = `
        <polygon points="110,35 240,35 295,135 55,135" fill="#fff7ea" stroke="#b76518" stroke-width="3"></polygon>
        <line x1="240" y1="35" x2="240" y2="135" stroke="#2e638b" stroke-width="3" stroke-dasharray="6 5"></line>
        ${label(`${data.top} cm`, 175, 27)}
        ${label(`${data.bottom} cm`, 175, 158)}
        ${label(`${data.height} cm`, 270, 90)}
      `;
    } else {
      svg = `
        <rect x="45" y="45" width="150" height="95" fill="#e8f5ec" stroke="#287a58" stroke-width="3"></rect>
        <polygon points="195,45 285,140 195,140" fill="#e8f1f7" stroke="#2e638b" stroke-width="3"></polygon>
        ${label(`${data.width} cm`, 120, 162)}
        ${label(`${data.height} cm`, 24, 96)}
        ${label(`${data.triBase} cm`, 240, 162)}
      `;
    }
    return `<div class="shape-card"><svg viewBox="0 0 340 180" role="img" aria-label="面積圖形">${svg}</svg></div>`;
  }

  function volumeCuboid(topic) {
    const l = randInt(4, 12);
    const w = randInt(3, 9);
    const h = randInt(2, 8);
    const result = l * w * h;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "長方體體積",
      prompt: `一個長方體長 ${l} cm、闊 ${w} cm、高 ${h} cm，體積是多少？`,
      diagram: cuboidDiagram(l, w, h),
      hint: "長方體體積 = 長 × 闊 × 高。",
      work: `${l} × ${w} × ${h} = ${result} cm³。`
    }, String(result), [String(l + w + h), String(l * w), String(result + l)]);
  }

  function volumeComposite(topic) {
    const a = randInt(2, 6);
    const b = randInt(2, 5);
    const c = randInt(2, 6);
    const cubes = a * b * c + b * c;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "拼砌立體體積",
      prompt: `每個小正方體體積是 1 cm³。一個 ${a} × ${b} × ${c} 的長方體旁邊再加一排 ${b} × ${c} 個小正方體，總體積是多少？`,
      hint: "先計原本長方體有幾個小正方體，再加上新增的一排。",
      work: `${a} × ${b} × ${c} + ${b} × ${c} = ${cubes} cm³。`
    }, String(cubes), [String(a * b * c), String(cubes + a), String(a + b + c)]);
  }

  function volumeCompare(topic) {
    const a = [randInt(3, 8), randInt(3, 8), randInt(3, 8)];
    const b = [randInt(3, 8), randInt(3, 8), randInt(3, 8)];
    const va = a[0] * a[1] * a[2];
    const vb = b[0] * b[1] * b[2];
    const answer = va > vb ? "甲" : va < vb ? "乙" : "一樣";
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "比較體積",
      prompt: `甲長方體是 ${a.join(" cm × ")} cm，乙長方體是 ${b.join(" cm × ")} cm。哪一個體積較大？`,
      hint: "分別用長 × 闊 × 高求體積。",
      work: `甲：${a.join(" × ")} = ${va} cm³；乙：${b.join(" × ")} = ${vb} cm³，所以答案是${answer}。`
    }, answer, ["甲", "乙", "一樣"].filter((item) => item !== answer));
  }

  function cuboidDiagram(l, w, h) {
    return `
      <div class="shape-card">
        <svg viewBox="0 0 340 190" role="img" aria-label="長方體">
          <polygon points="70,70 220,70 270,35 120,35" fill="#e8f1f7" stroke="#2e638b" stroke-width="3"></polygon>
          <polygon points="220,70 270,35 270,125 220,160" fill="#dceaf3" stroke="#2e638b" stroke-width="3"></polygon>
          <rect x="70" y="70" width="150" height="90" fill="#eef7f1" stroke="#287a58" stroke-width="3"></rect>
          <text x="145" y="181" text-anchor="middle" font-size="14">${l} cm</text>
          <text x="279" y="87" font-size="14">${w} cm</text>
          <text x="50" y="118" font-size="14">${h} cm</text>
        </svg>
      </div>
    `;
  }

  function circleRadiusDiameter(topic) {
    const radius = randInt(3, 15);
    const answer = radius * 2;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "半徑和直徑",
      prompt: `一個圓的半徑是 ${radius} cm，直徑是多少？`,
      diagram: circleDiagram(radius),
      hint: "直徑 = 半徑 × 2。",
      work: `${radius} × 2 = ${answer} cm。`
    }, String(answer), [String(radius), String(radius + 2), String(radius * radius)]);
  }

  function circleProperties(topic) {
    const cases = [
      {
        prompt: "以下哪一句是圓的正確性質？",
        answer: "圓上所有點到圓心的距離相同",
        distractors: ["所有弦都一定一樣長", "直徑比半徑短", "圓只有四條半徑"],
        work: "圓的基本性質之一，是圓上所有點與圓心距離相同。"
      },
      {
        prompt: "以圓上任何兩點為端點的線段中，哪一種最長？",
        answer: "經過圓心的線段",
        distractors: ["不經過圓心的線段", "半徑", "圓周"],
        work: "經過圓心並連接圓上兩點的線段是直徑，是這類線段中最長的。"
      }
    ];
    const item = sample(cases);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "圓的基本性質",
      prompt: item.prompt,
      hint: "留意圓心、半徑和直徑的關係。",
      work: item.work
    }, item.answer, item.distractors);
  }

  function circleDiagram(radius) {
    return `
      <div class="shape-card">
        <svg viewBox="0 0 320 170" role="img" aria-label="圓">
          <circle cx="150" cy="82" r="58" fill="#fff7ea" stroke="#b76518" stroke-width="3"></circle>
          <line x1="150" y1="82" x2="208" y2="82" stroke="#2e638b" stroke-width="3"></line>
          <line x1="92" y1="82" x2="208" y2="82" stroke="#287a58" stroke-width="2" stroke-dasharray="6 4"></line>
          <circle cx="150" cy="82" r="4" fill="#1d252c"></circle>
          <text x="179" y="74" text-anchor="middle" font-size="14">半徑 ${radius} cm</text>
          <text x="150" y="154" text-anchor="middle" font-size="14">直徑 = ?</text>
        </svg>
      </div>
    `;
  }

  function solidCrossSection(topic) {
    const cases = [
      ["圓柱中平行於底的截面是甚麼形狀？", "圓形", ["三角形", "長方形", "不規則圖形"], "圓柱的底是圓形，平行於底的截面形狀和大小與底相同。"],
      ["角柱中平行於底的截面有甚麼特點？", "形狀和大小與底相同", ["一定是圓形", "一定比底大", "一定是三角形"], "角柱平行於底的截面，形狀和大小都與底相同。"],
      ["角錐中平行於底的截面有甚麼特點？", "形狀相似但大小不同", ["大小一定與底相同", "一定是圓形", "沒有截面"], "角錐平行於底的截面會隨位置變大或變小。"]
    ];
    const item = sample(cases);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "立體圖形截面",
      prompt: item[0],
      hint: "先想清楚立體圖形的底是甚麼形狀，再看截面是否平行於底。",
      work: item[3]
    }, item[1], item[2]);
  }

  function solidCounts(topic) {
    const prismSides = randInt(3, 6);
    const faces = prismSides + 2;
    const edges = prismSides * 3;
    const vertices = prismSides * 2;
    const ask = sample(["面", "稜", "頂點"]);
    const answer = ask === "面" ? faces : ask === "稜" ? edges : vertices;
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "角柱的面、稜和頂點",
      prompt: `一個底是 ${prismSides} 邊形的角柱有多少個${ask}？`,
      hint: "角柱有兩個相同的底；側面數等於底的邊數。",
      work: `${prismSides} 邊形角柱有 ${faces} 個面、${edges} 條稜、${vertices} 個頂點。`
    }, String(answer), [String(answer + 1), String(Math.max(1, answer - 1)), String(prismSides)]);
  }

  function solidNet(topic) {
    const cases = [
      {
        prompt: "正方體的摺紙圖樣由多少個正方形組成？",
        answer: "6",
        distractors: ["4", "8", "12"],
        work: "正方體有 6 個面，所以摺紙圖樣由 6 個正方形組成。"
      },
      {
        prompt: "圓柱的摺紙圖樣通常包括甚麼？",
        answer: "兩個圓形和一個長方形",
        distractors: ["一個圓形和三個三角形", "六個正方形", "兩個三角形和一個長方形"],
        work: "圓柱有兩個圓形底和一個彎曲側面，展開後側面是長方形。"
      }
    ];
    const item = sample(cases);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "摺紙圖樣",
      prompt: item.prompt,
      hint: "摺紙圖樣需要包括立體圖形所有面。",
      work: item.work
    }, item.answer, item.distractors);
  }

  function makeChartData() {
    const scale = sample([1000, 10000, 100000]);
    const groups = ["甲校", "乙校", "丙校"];
    const boys = groups.map(() => randInt(2, 8) * scale);
    const girls = groups.map(() => randInt(2, 8) * scale);
    return { scale, groups, boys, girls };
  }

  function chartDiagram(data) {
    const max = Math.max(...data.boys, ...data.girls);
    const chartWidth = 420;
    const barMax = 250;
    const rows = data.groups.map((group, index) => {
      const y = 38 + index * 62;
      const boyW = Math.round(data.boys[index] / max * barMax);
      const girlW = Math.round(data.girls[index] / max * barMax);
      return `
        <text x="18" y="${y + 12}" font-size="13" fill="#1d252c">${group}</text>
        <rect x="72" y="${y}" width="${boyW}" height="18" fill="#2e638b"></rect>
        <rect x="72" y="${y + 24}" width="${girlW}" height="18" fill="#b76518"></rect>
        <text x="${78 + boyW}" y="${y + 14}" font-size="12">${formatNumber(data.boys[index])}</text>
        <text x="${78 + girlW}" y="${y + 38}" font-size="12">${formatNumber(data.girls[index])}</text>
      `;
    }).join("");
    return `
      <div class="chart-card">
        <svg viewBox="0 0 ${chartWidth} 245" role="img" aria-label="複合棒形圖">
          <text x="72" y="18" font-size="14" font-weight="700">參加課外活動人數</text>
          ${rows}
          <rect x="72" y="218" width="16" height="12" fill="#2e638b"></rect>
          <text x="94" y="229" font-size="12">男生</text>
          <rect x="150" y="218" width="16" height="12" fill="#b76518"></rect>
          <text x="172" y="229" font-size="12">女生</text>
          <text x="250" y="229" font-size="12">一格代表 ${formatNumber(data.scale)} 人</text>
        </svg>
      </div>
    `;
  }

  function barChartRead(topic) {
    const data = makeChartData();
    const index = randInt(0, 2);
    const answer = data.boys[index] + data.girls[index];
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "闡釋複合棒形圖",
      prompt: `${data.groups[index]} 參加課外活動的男生和女生合共多少人？`,
      diagram: chartDiagram(data),
      hint: "同一組的兩條棒表示兩類資料，把它們相加。",
      work: `${formatNumber(data.boys[index])} + ${formatNumber(data.girls[index])} = ${formatNumber(answer)}。`
    }, formatNumber(answer), [formatNumber(data.boys[index]), formatNumber(data.girls[index]), formatNumber(answer + data.scale)]);
  }

  function barChartDifference(topic) {
    const data = makeChartData();
    const index = randInt(0, 2);
    const answer = Math.abs(data.boys[index] - data.girls[index]);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "比較複合棒形圖資料",
      prompt: `${data.groups[index]} 的男生和女生人數相差多少？`,
      diagram: chartDiagram(data),
      hint: "相差即用較大的數減較小的數。",
      work: `|${formatNumber(data.boys[index])} - ${formatNumber(data.girls[index])}| = ${formatNumber(answer)}。`
    }, formatNumber(answer), [formatNumber(data.scale), formatNumber(data.boys[index] + data.girls[index]), formatNumber(answer + data.scale)]);
  }

  function barChartScale(topic) {
    const data = makeChartData();
    return makeChoiceQuestion({
      topicId: topic.id,
      title: "選擇棒形圖比例",
      prompt: `根據圖例，這個複合棒形圖一格代表多少人？`,
      diagram: chartDiagram(data),
      hint: "先看圖例或座標旁邊的比例說明。",
      work: `圖例寫明一格代表 ${formatNumber(data.scale)} 人。`
    }, formatNumber(data.scale), [formatNumber(1000), formatNumber(10000), formatNumber(100000)].filter((item) => item !== formatNumber(data.scale)));
  }
})();
