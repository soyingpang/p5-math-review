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
    resetProgress: document.getElementById("resetProgress")
  };

  init();

  function init() {
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
    els.skipQuestion.addEventListener("click", nextQuestion);
    els.newQuestion.addEventListener("click", nextQuestion);
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

  function renderViewTabs() {
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
    const unique = [correctLabel, ...distractors].filter((item, index, list) => list.indexOf(item) === index);
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

  function chineseQuestion(topic) {
    const level = gradeLevel(topic.gradeId);
    const readingItems = level <= 3
      ? [
          ["「小狗在門口搖尾巴。」這句主要寫甚麼？", "小狗的動作", ["天氣", "時間", "地點"], "題目中的重點是「小狗」和「搖尾巴」，所以主要寫小狗的動作。"],
          ["「妹妹把書包放在椅子上。」誰把書包放好？", "妹妹", ["哥哥", "老師", "媽媽"], "句子的主語是妹妹。"]
        ]
      : [
          ["文章標題若是《一次難忘的比賽》，最可能屬於哪一類文章？", "記敘文", ["說明文", "議論文", "書信"], "題目含有事件和經歷，通常以記敘為主。"],
          ["閱讀時要概括段意，最重要先找甚麼？", "中心句或重點事件", ["生字筆畫", "標點數量", "作者姓名"], "段意要抓住該段最核心的意思。"]
        ];
    const writingItems = [
      ["「因為下雨，____ 我帶了雨傘。」橫線應填入甚麼？", "所以", ["但是", "如果", "雖然"], "「因為……所以……」表示因果關係。"],
      ["寫作開首最需要做到甚麼？", "交代人物、時間、地點或事情", ["只寫結尾", "重複題目十次", "完全不用標點"], "清楚交代背景，讀者才容易明白。"]
    ];
    const wordItems = [
      ["「安靜」的相反詞較接近哪一個？", "吵鬧", ["整齊", "明亮", "寒冷"], "安靜與吵鬧意思相反。"],
      ["「專心」較適合形容哪一種情況？", "認真做功課", ["四處奔跑", "胡亂塗寫", "大聲爭吵"], "專心表示集中精神。"]
    ];
    const seniorItems = [
      ["議論文的論點應該怎樣？", "清楚表明立場", ["只列出故事人物", "避免任何例子", "只寫景物"], "論點是議論文的核心，需要清楚可辯。"],
      ["文言文翻譯時，最應先掌握甚麼？", "關鍵字詞和句子關係", ["字體顏色", "篇幅長短", "標題裝飾"], "理解關鍵詞和句式，才能準確翻譯。"]
    ];
    const pool = level >= 10 ? seniorItems : topic.name.includes("寫") ? writingItems : topic.name.includes("字") || topic.name.includes("語文") ? wordItems : readingItems;
    const item = sample(pool);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: topic.name,
      prompt: item[0],
      hint: "先找題目關鍵詞，再判斷它問的是內容、語文知識還是表達方法。",
      work: item[3]
    }, item[1], item[2]);
  }

  function englishQuestion(topic) {
    const level = gradeLevel(topic.gradeId);
    const primary = [
      ["Choose the correct word: She ____ to school every day.", "goes", ["go", "going", "went"], "For he/she/it in the simple present tense, add -s or -es: she goes."],
      ["Which word is an adjective?", "happy", ["run", "quickly", "school"], "An adjective describes a noun or a person."],
      ["Choose the best response: How are you?", "I'm fine, thank you.", ["It is a pencil.", "At seven o'clock.", "In the box."], "The question asks about someone's condition."]
    ];
    const junior = [
      ["Choose the correct tense: I ____ my homework before dinner yesterday.", "finished", ["finish", "finishes", "will finish"], "Yesterday shows the past tense, so use finished."],
      ["Which connector shows contrast?", "however", ["because", "therefore", "firstly"], "However introduces a contrasting idea."],
      ["What is the main purpose of a topic sentence?", "To show the main idea of a paragraph", ["To end the whole essay", "To list every example", "To replace punctuation"], "A topic sentence guides the paragraph."]
    ];
    const senior = [
      ["Which phrase is most suitable for a formal argumentative essay?", "It can be argued that", ["You know what", "Loads of people say", "This is super cool"], "Formal writing avoids casual speech and uses precise phrasing."],
      ["In reading comprehension, evidence-based answers should include what?", "Relevant textual support", ["Only personal feelings", "A copied title only", "Random examples"], "Evidence from the text supports the answer."],
      ["Choose the more precise verb: The report ____ several causes of the problem.", "identifies", ["does", "gets", "makes"], "Identifies precisely means points out or recognizes."]
    ];
    const item = sample(level <= 6 ? primary : level <= 9 ? junior : senior);
    return makeChoiceQuestion({
      topicId: topic.id,
      title: topic.name,
      prompt: item[0],
      hint: "Look at the keywords in the sentence and decide the grammar, meaning or text purpose.",
      work: item[3]
    }, item[1], item[2]);
  }

  function mathQuestion(topic) {
    const level = gradeLevel(topic.gradeId);
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
      }, String(result), [String(result + 1), String(Math.max(1, result - 1)), String(a - b)]);
    }
    if (level <= 6) {
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
    if (level <= 9) {
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
