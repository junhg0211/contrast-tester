function calculateColorContrast(color1, color2) {
  /**
   * 두 색상의 대비 비율을 WCAG 2.0 기준에 따라 계산하여 1에서 21 사이의 값으로 반환합니다.
   *
   * @param {string} color1 - 첫 번째 색상 (RGB 16진수 문자열, 예: "#FF0000").
   * @param {string} color2 - 두 번째 색상 (RGB 16진수 문자열, 예: "#0000FF").
   * @returns {number|null} 두 색상 사이의 명도 대비 비율 (1에서 21 사이의 실수).
   * 유효하지 않은 색상 형식이면 null을 반환합니다.
   */
  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  }

  function relativeLuminance(rgb) {
    const [r, g, b] = rgb.map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const l1 = relativeLuminance(rgb1) + 0.05;
  const l2 = relativeLuminance(rgb2) + 0.05;

  return l1 > l2 ? l1 / l2 : l2 / l1;
}

function colorNameToHex(colorName) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = colorName;
    return colorToHex(ctx.fillStyle);
}

function colorToHex(color) {
  if (!color.startsWith("rgb")) {
    return color; // 이미 16진수 또는 다른 형식이면 그대로 반환
  }
  const values = color.substring(color.indexOf("(") + 1, color.indexOf(")")).split(",").map(Number);
  return `#${toHex(values[0])}${toHex(values[1])}${toHex(values[2])}`;
}

function toHex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

const addColorButton = document.querySelector("#add-color");
const colorInput = document.querySelector("#color-input");
const colors = [];

addColorButton.onclick = () => {
  if (colorInput.value.trim() === "")
    return

  colors.push(colorNameToHex(colorInput.value.trim()));
  colorInput.value = "";

  refreshDivs();
};

const colorsDiv = document.querySelector("#colors");
const contrastsDiv = document.querySelector("#contrasts");

function refreshDivs() {
  // colorsdiv
  colorsDiv.innerHTML = "";
  colors.forEach(c => {
    const div = document.createElement("div");
    div.innerText = c;
    div.style.backgroundColor = c;
    colorsDiv.appendChild(div);
  });

  // contrastsdiv
  const contrasts = []; // a, b, contrast
  for (let i = 0; i < colors.length; i++) {
    const colora = colors[i];
    for (let j = i+1; j < colors.length; j++) {
    const colorb = colors[j];
      contrasts.push([colora, colorb, calculateColorContrast(colora, colorb)]);
    }
  }
  console.log(contrasts);

  contrastsDiv.innerHTML = "";
  contrasts
    .sort((a, b) => a[2] - b[2])
    .forEach(contrast => {
      const [a, b, c] = contrast;
      const div = document.createElement("div");
      div.innerText = c;
      div.style.color = a;
      div.style.backgroundColor = b;
      contrastsDiv.appendChild(div);
    });
}
