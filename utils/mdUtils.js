// mdUtils.js
export class MdUtils {
  static md2html(markdownText) {
    // 将 Markdown 文本按行分割
    const lines = markdownText.split('\n');
    let html = '';
    let isInList = false; // 标记是否在列表中
    let listType = '';   // 列表类型：ul 或 ol

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // 处理空行（段落分隔）
      if (line.trim() === '') {
        if (isInList) {
          html += `</${listType}>\n`;
          isInList = false;
        }
        html += '<br>\n'; // 使用 <br> 作为段落分隔，而不是 <p>，以简化处理
        continue;
      }

      // 处理标题
      let headingLevel = 0;
      while (line.startsWith('#')) {
        headingLevel++;
        line = line.substring(1);
      }
      if (headingLevel > 0) {
        line = line.trim();
        html += `<h${headingLevel}>${inlineReplace(line)}</h${headingLevel}>\n`;
        continue;
      }

      // 处理无序列表
      if (line.match(/^[\*\-\+] /)) {
        if (!isInList) {
          html += '<ul>\n';
          isInList = true;
          listType = 'ul';
        }
        line = line.substring(2).trim(); // 去掉列表标记
        html += `<li>${inlineReplace(line)}</li>\n`;
        continue;
      }

      // 处理有序列表
      if (line.match(/^\d+\. /)) {
        if (!isInList) {
          html += '<ol>\n';
          isInList = true;
          listType = 'ol';
        }
        line = line.replace(/^\d+\. /, '').trim(); // 去掉列表标记
        html += `<li>${inlineReplace(line)}</li>\n`;
        continue;
      }

      // 处理水平分割线
      if (line.match(/^(\-{3,}|\*{3,}|_{3,})$/)) {
        html += "<hr>\n";
        continue;
      }

      //处理代码块
      if (line.startsWith('```')) {
        let codeContent = '';
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeContent += lines[i] + '\n';
          i++;
        }
        html += `<pre><code>${escapeHtml(codeContent.trim())}</code></pre>\n`
        continue;
      }

      // 处理段落
      if (!isInList) {
        line = line.trim();
        line = inlineReplace(line); //处理行内元素
        line = line.replace(/ {2}$/, '<br>'); //处理换行符
        html += `<p>${line}</p>\n`;
      }
    }

    // 如果列表未结束，则结束列表
    if (isInList) {
      html += `</${listType}>\n`;
    }


    // 行内元素替换函数 (粗体、斜体、链接、图片、行内代码)
    function inlineReplace(text) {

      //转义
      text = text.replace(/\\([`*_{}\[\]()#+\-.!])/g, '$1');

      // 粗体
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

      // 斜体
      text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
      text = text.replace(/_(.*?)_/g, '<em>$1</em>');

      // 链接
      text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

      // 图片
      text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');

      // 行内代码
      text = text.replace(/`(.*?)`/g, '<code>$1</code>');

      return text;
    }

    // HTML 实体转义函数 (防止 XSS 攻击)
    function escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    return html;
  }

}
