const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const createPdf = async (title, content) => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lineHeight = 16;
  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const maxLineWidth = width - 100; // 50px margin on each side

  // Function to wrap text by words (including \n handling)
  const wrapTextByWords = (text, font, fontSize, maxWidth) => {
    const paragraphs = text.split('\n');
    const lines = [];

    for (let para of paragraphs) {
      const words = para.split(' ');
      let line = '';

      for (let word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (textWidth <= maxWidth) {
          line = testLine;
        } else {
          lines.push(line);
          line = word;
        }
      }

      if (line) lines.push(line);
      lines.push(''); // extra line break for paragraph spacing
    }

    return lines;
  };

  const lines = [
    title,
    '',
    ...wrapTextByWords(content, font, fontSize, maxLineWidth)
  ];

  let y = height - 50;

  for (let line of lines) {
    if (y < 50) {
      page = pdfDoc.addPage(); // start new page if needed
      y = height - 50;
    }

    page.drawText(line, {
      x: 50,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    y -= lineHeight;
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

module.exports = createPdf;

