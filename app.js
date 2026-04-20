(function() {
  "use strict";

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js').catch(function(err) {
        console.log('SW registration skipped:', err);
      });
    });
  }

  var levels = {
    easy:   { minW: 2, maxW: 5,  minL: 2, maxL: 5,  cell: 44 },
    medium: { minW: 3, maxW: 8,  minL: 3, maxL: 8,  cell: 34 },
    hard:   { minW: 4, maxW: 12, minL: 4, maxL: 10, cell: 26 }
  };

  var level = 'easy';
  var mode = 'count';
  var current = { w: 4, l: 3 };
  var marked = {};
  var markedCount = 0;
  var scoreRight = 0;
  var scoreTries = 0;
  var streak = 0;
  var qNum = 1;
  var answeredCurrent = false;

  var SVG_NS = "http://www.w3.org/2000/svg";

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function $(id) { return document.getElementById(id); }

  function generateQuestion() {
    var lv = levels[level];
    var w, l, attempts = 0;
    do {
      w = randInt(lv.minW, lv.maxW);
      l = randInt(lv.minL, lv.maxL);
      attempts++;
    } while (w === current.w && l === current.l && attempts < 6);
    current = { w: w, l: l };
    marked = {};
    markedCount = 0;
    answeredCurrent = false;
    resetFormula();
    $('fb-count').className = 'feedback';
    $('fb-count').textContent = '';
    drawShape();
    updateQuestionLabel();
  }

  function newQuestion() {
    qNum++;
    generateQuestion();
    updateScoreDisplay();
  }

  function drawShape() {
    var w = current.w;
    var l = current.l;
    var svg = $('shape-svg');
    var cell = levels[level].cell;
    var totalW = w * cell;
    var totalH = l * cell;
    var padX = 70;
    var padY = 60;
    var vbW = totalW + padX * 2;
    var vbH = totalH + padY * 2 + 20;
    svg.setAttribute('viewBox', '0 0 ' + vbW + ' ' + vbH);

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var defs = document.createElementNS(SVG_NS, 'defs');
    var marker = document.createElementNS(SVG_NS, 'marker');
    marker.setAttribute('id', 'arr');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '5');
    marker.setAttribute('markerHeight', '5');
    marker.setAttribute('orient', 'auto-start-reverse');
    var markerPath = document.createElementNS(SVG_NS, 'path');
    markerPath.setAttribute('d', 'M2 1L8 5L2 9');
    markerPath.setAttribute('fill', 'none');
    markerPath.setAttribute('stroke', '#3C3489');
    markerPath.setAttribute('stroke-width', '1.5');
    markerPath.setAttribute('stroke-linecap', 'round');
    markerPath.setAttribute('stroke-linejoin', 'round');
    marker.appendChild(markerPath);
    defs.appendChild(marker);
    svg.appendChild(defs);

    for (var row = 0; row < l; row++) {
      for (var col = 0; col < w; col++) {
        var id = row + '-' + col;
        var x = padX + col * cell;
        var y = padY + row * cell;
        var isMarked = !!marked[id];
        var rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('class', 'sq' + (isMarked ? ' marked' : ''));
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', cell);
        rect.setAttribute('height', cell);
        rect.setAttribute('fill', isMarked ? '#D4537E' : '#9FE1CB');
        rect.setAttribute('stroke', '#04342C');
        rect.setAttribute('stroke-width', '0.8');
        rect.setAttribute('data-id', id);
        svg.appendChild(rect);
      }
    }

    var wArrowY = padY - 22;
    var lArrowX = padX + totalW + 22;

    var wLine = document.createElementNS(SVG_NS, 'line');
    wLine.setAttribute('x1', padX);
    wLine.setAttribute('y1', wArrowY);
    wLine.setAttribute('x2', padX + totalW);
    wLine.setAttribute('y2', wArrowY);
    wLine.setAttribute('stroke', '#3C3489');
    wLine.setAttribute('stroke-width', '1.4');
    wLine.setAttribute('marker-start', 'url(#arr)');
    wLine.setAttribute('marker-end', 'url(#arr)');
    svg.appendChild(wLine);

    var wText = document.createElementNS(SVG_NS, 'text');
    wText.setAttribute('x', padX + totalW / 2);
    wText.setAttribute('y', wArrowY - 10);
    wText.setAttribute('text-anchor', 'middle');
    wText.setAttribute('fill', '#3C3489');
    wText.setAttribute('font-size', '15');
    wText.setAttribute('font-weight', '500');
    wText.textContent = 'Width = ' + w;
    svg.appendChild(wText);

    var lLine = document.createElementNS(SVG_NS, 'line');
    lLine.setAttribute('x1', lArrowX);
    lLine.setAttribute('y1', padY);
    lLine.setAttribute('x2', lArrowX);
    lLine.setAttribute('y2', padY + totalH);
    lLine.setAttribute('stroke', '#3C3489');
    lLine.setAttribute('stroke-width', '1.4');
    lLine.setAttribute('marker-start', 'url(#arr)');
    lLine.setAttribute('marker-end', 'url(#arr)');
    svg.appendChild(lLine);

    var lText = document.createElementNS(SVG_NS, 'text');
    lText.setAttribute('x', lArrowX + 10);
    lText.setAttribute('y', padY + totalH / 2);
    lText.setAttribute('dominant-baseline', 'central');
    lText.setAttribute('fill', '#3C3489');
    lText.setAttribute('font-size', '15');
    lText.setAttribute('font-weight', '500');
    lText.textContent = 'L = ' + l;
    svg.appendChild(lText);

    updateCount();
  }

  function toggleMark(id) {
    if (mode !== 'count') return;
    if (marked[id]) {
      delete marked[id];
      markedCount--;
    } else {
      marked[id] = true;
      markedCount++;
    }
    drawShape();
  }

  function updateCount() {
    $('count-num').textContent = markedCount;
  }

  function resetMarks() {
    marked = {};
    markedCount = 0;
    drawShape();
    $('fb-count').className = 'feedback';
    $('fb-count').textContent = '';
  }

  function resetFormula() {
    $('in-w').value = '';
    $('in-l').value = '';
    $('in-a').value = '';
    $('fb-formula').className = 'feedback';
    $('fb-formula').textContent = '';
  }

  function setLevel(lv) {
    level = lv;
    var ids = ['easy', 'medium', 'hard'];
    for (var i = 0; i < ids.length; i++) {
      var el = $('lv-' + ids[i]);
      el.className = ids[i] === lv ? 'level-btn active' : 'level-btn';
    }
    $('level-badge').textContent = 'Level: ' + lv;
    generateQuestion();
  }

  function setMode(m) {
    mode = m;
    $('tab-count').className = 'tab' + (m === 'count' ? ' active' : '');
    $('tab-formula').className = 'tab' + (m === 'formula' ? ' active' : '');
    $('panel-count').className = 'mode-panel' + (m === 'count' ? ' active' : '');
    $('panel-formula').className = 'mode-panel' + (m === 'formula' ? ' active' : '');
  }

  function checkCount() {
    var correct = current.w * current.l;
    var fb = $('fb-count');

    if (markedCount === 0) {
      fb.className = 'feedback hint';
      fb.textContent = 'Tap each square inside the shape to count it. Try again!';
      return;
    }

    scoreTries++;

    if (markedCount === correct) {
      fb.className = 'feedback correct';
      fb.textContent = 'Great job! You counted ' + correct + ' square units. Area = ' + correct + ' units\u00B2.';
      if (!answeredCurrent) {
        scoreRight++;
        streak++;
        answeredCurrent = true;
      }
    } else if (markedCount < correct) {
      fb.className = 'feedback hint';
      fb.textContent = 'You counted ' + markedCount + '. Keep going, do not miss any squares!';
      streak = 0;
    } else {
      fb.className = 'feedback wrong';
      fb.textContent = 'You marked ' + markedCount + ', but there are only ' + correct + ' squares. Clear and try again!';
      streak = 0;
    }
    updateScoreDisplay();
  }

  function checkFormula() {
    var w = parseInt($('in-w').value, 10);
    var l = parseInt($('in-l').value, 10);
    var a = parseInt($('in-a').value, 10);
    var fb = $('fb-formula');

    if (isNaN(w) || isNaN(l) || isNaN(a)) {
      fb.className = 'feedback hint';
      fb.textContent = 'Fill in W, L, and the area to check your answer.';
      return;
    }

    scoreTries++;
    var correctA = current.w * current.l;

    if (w === current.w && l === current.l && a === correctA) {
      fb.className = 'feedback correct';
      fb.textContent = 'Perfect! A = ' + current.w + ' \u00D7 ' + current.l + ' = ' + correctA + ' units\u00B2. You used the formula!';
      if (!answeredCurrent) {
        scoreRight++;
        streak++;
        answeredCurrent = true;
      }
    } else if (w !== current.w) {
      fb.className = 'feedback wrong';
      fb.textContent = 'Check the width. Count the squares across the top.';
      streak = 0;
    } else if (l !== current.l) {
      fb.className = 'feedback wrong';
      fb.textContent = 'Check the length. Count the squares down the side.';
      streak = 0;
    } else if (a !== w * l) {
      fb.className = 'feedback wrong';
      fb.textContent = 'W \u00D7 L is not ' + a + '. Try ' + w + ' \u00D7 ' + l + ' again.';
      streak = 0;
    } else {
      fb.className = 'feedback wrong';
      fb.textContent = 'Not quite. The correct area is ' + correctA + ' units\u00B2.';
      streak = 0;
    }
    updateScoreDisplay();
  }

  function updateQuestionLabel() {
    $('q-num').textContent = 'Question ' + qNum;
    $('score-q').textContent = qNum;
  }

  function updateScoreDisplay() {
    $('score-right').textContent = scoreRight;
    $('score-tries').textContent = scoreTries;
    $('score-streak').textContent = streak;
    var fire = $('fire');
    fire.className = streak >= 3 ? 'streak-fire visible' : 'streak-fire';
    $('score-q').textContent = qNum;
  }

  function addTap(el, handler) {
    if (!el) return;
    var handled = false;
    el.addEventListener('touchstart', function(e) {
      handled = true;
      e.preventDefault();
      handler(e);
      setTimeout(function() { handled = false; }, 350);
    }, { passive: false });
    el.addEventListener('click', function(e) {
      if (handled) { e.preventDefault(); return; }
      handler(e);
    });
  }

  function init() {
    addTap($('lv-easy'), function() { setLevel('easy'); });
    addTap($('lv-medium'), function() { setLevel('medium'); });
    addTap($('lv-hard'), function() { setLevel('hard'); });

    addTap($('tab-count'), function() { setMode('count'); });
    addTap($('tab-formula'), function() { setMode('formula'); });

    addTap($('btn-new-q'), newQuestion);
    addTap($('btn-check-count'), checkCount);
    addTap($('btn-clear-marks'), resetMarks);
    addTap($('btn-next-count'), newQuestion);
    addTap($('btn-check-formula'), checkFormula);
    addTap($('btn-clear-formula'), resetFormula);
    addTap($('btn-next-formula'), newQuestion);

    var svg = $('shape-svg');
    var tapHandled = false;
    svg.addEventListener('touchstart', function(e) {
      var target = e.target;
      if (target && target.getAttribute && target.getAttribute('data-id')) {
        tapHandled = true;
        e.preventDefault();
        toggleMark(target.getAttribute('data-id'));
        setTimeout(function() { tapHandled = false; }, 350);
      }
    }, { passive: false });
    svg.addEventListener('click', function(e) {
      if (tapHandled) { e.preventDefault(); return; }
      var target = e.target;
      if (target && target.getAttribute && target.getAttribute('data-id')) {
        toggleMark(target.getAttribute('data-id'));
      }
    });

    if (window.navigator.standalone) {
      var note = $('install-note');
      if (note) note.className = 'install-note hidden';
    }

    generateQuestion();
    updateScoreDisplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
