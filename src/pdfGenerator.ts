import { ContentCard } from './types';
import { formatDateBR, getChecklistProgress } from './utils';

function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}

function stageName(stageId: string): string {
  const map: Record<string, string> = {
    ideas: 'Ideias / Backlog',
    production: 'Produção',
    review: 'Revisão',
    done: 'Concluído ✓',
  };
  return map[stageId] ?? stageId;
}

function priorityEmoji(priority: string): string {
  const map: Record<string, string> = {
    Alta: '🔴 Alta',
    Média: '🟡 Média',
    Baixa: '⚪ Baixa',
  };
  return map[priority] ?? priority;
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Gera e abre a janela de impressão (PDF) com o resumo do card.
 * O usuário pode salvar como PDF pelo diálogo de impressão do browser.
 */
export function generateCardPDF(card: ContentCard): void {
  const checklistProgress = getChecklistProgress(card.checklist || []);
  const generatedAt = formatDateTime(new Date().toISOString());
  const attachments = card.attachments ?? [];
  const fileAttachments = attachments.filter((a) => !a.isLink);
  const linkAttachments = attachments.filter((a) => a.isLink);

  const checklistRows = (card.checklist || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0; width:30px;">
          <span style="display:inline-block; width:16px; height:16px; border-radius:4px; border:2px solid ${
            item.completed ? '#10b981' : '#94a3b8'
          }; background:${item.completed ? '#10b981' : 'transparent'}; text-align:center; line-height:14px; font-size:11px; color:#fff;">
            ${item.completed ? '✓' : ''}
          </span>
        </td>
        <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0; font-size:13px; color:${item.completed ? '#94a3b8' : '#1e293b'}; text-decoration:${item.completed ? 'line-through' : 'none'};">
          ${item.text}
        </td>
      </tr>`
    )
    .join('');

  const tagsHtml = (card.tags || [])
    .map(
      (tag) =>
        `<span style="display:inline-block; padding:2px 8px; background:#e0f2fe; color:#0369a1; border-radius:999px; font-size:11px; font-weight:600; margin:2px;">#${tag}</span>`
    )
    .join('');

  const fileAttachmentsHtml =
    fileAttachments.length > 0
      ? fileAttachments
          .map((a) => {
            const isRemote = /^https?:\/\//i.test(a.url);
            const nameHtml = isRemote
              ? `<a href="${a.url}" target="_blank" style="color:#0369a1;">${a.name}</a>`
              : `<strong>${a.name}</strong>`;
            return `<li style="padding:4px 0; font-size:12px; color:#475569;">
                📄 ${nameHtml}${a.size ? ` <span style="color:#94a3b8;">(${formatFileSize(a.size)})</span>` : ''}
                ${a.notes ? ` — <em style="color:#64748b;">${a.notes}</em>` : ''}
                <span style="color:#94a3b8; font-size:11px;"> · ${formatDateTime(a.uploadedAt)}</span>
              </li>`;
          })
          .join('')
      : '<li style="color:#94a3b8; font-size:12px;">Nenhum arquivo anexado</li>';

  const linkAttachmentsHtml =
    linkAttachments.length > 0
      ? linkAttachments
          .map(
            (a) =>
              `<li style="padding:4px 0; font-size:12px; color:#475569;">
                🔗 <a href="${a.url}" style="color:#0369a1;">${a.name}</a>
                ${a.notes ? ` — <em style="color:#64748b;">${a.notes}</em>` : ''}
              </li>`
          )
          .join('')
      : '<li style="color:#94a3b8; font-size:12px;">Nenhum link adicionado</li>';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Resumo — ${card.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #fff;
      color: #1e293b;
      padding: 32px 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 3px solid #0891b2;
      padding-bottom: 16px;
      margin-bottom: 24px;
      gap: 12px;
    }
    .header-left h1 {
      font-size: 20px;
      font-weight: 800;
      color: #0c4a6e;
      line-height: 1.3;
      margin-bottom: 4px;
    }
    .header-left .sub {
      font-size: 12px;
      color: #64748b;
    }
    .header-right {
      text-align: right;
      font-size: 11px;
      color: #94a3b8;
      min-width: 160px;
    }
    .kambam-badge {
      font-size: 11px;
      font-weight: 800;
      color: #0891b2;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .stage-badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      background: ${card.stage === 'done' ? '#d1fae5' : '#e0f2fe'};
      color: ${card.stage === 'done' ? '#065f46' : '#075985'};
      border: 1px solid ${card.stage === 'done' ? '#6ee7b7' : '#bae6fd'};
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
    }
    .info-card .label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .info-card .value {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }
    section { margin-bottom: 22px; }
    section h2 {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .progress-bar-bg {
      background: #e2e8f0;
      border-radius: 999px;
      height: 8px;
      overflow: hidden;
      margin-bottom: 6px;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #06b6d4, #3b82f6);
    }
    .progress-bar-fill.complete { background: #10b981; }
    table { width: 100%; border-collapse: collapse; }
    .notes-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 13px;
      color: #475569;
      line-height: 1.7;
      white-space: pre-wrap;
      min-height: 40px;
    }
    ul { list-style: none; padding: 0; }
    .footer {
      margin-top: 32px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 20px 24px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

  <!-- Print Button (hidden on actual print) -->
  <div class="no-print" style="margin-bottom:20px; display:flex; gap:10px;">
    <button onclick="window.print()" style="
      padding: 8px 20px;
      background: #0891b2;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    ">⬇️ Salvar como PDF</button>
    <button onclick="window.close()" style="
      padding: 8px 16px;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
    ">Fechar</button>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="kambam-badge">⚙ Kambam · Resumo de Conteúdo</div>
      <h1>${card.title}</h1>
      <div class="sub">
        Criado em ${formatDateTime(card.createdAt)}
        ${card.updatedAt ? ` · Atualizado em ${formatDateTime(card.updatedAt)}` : ''}
      </div>
    </div>
    <div class="header-right">
      <div style="margin-bottom:6px;"><span class="stage-badge">${stageName(card.stage)}</span></div>
      <div>📅 ${formatDateBR(card.scheduledDate, true)}</div>
    </div>
  </div>

  <!-- Info Grid -->
  <div class="grid-2">
    <div class="info-card">
      <div class="label">Formato</div>
      <div class="value">🎬 ${card.format || '—'}</div>
    </div>
    <div class="info-card">
      <div class="label">Prioridade</div>
      <div class="value">${priorityEmoji(card.priority)}</div>
    </div>
    <div class="info-card">
      <div class="label">Responsável</div>
      <div class="value">👤 ${card.assignee?.name || '—'}</div>
    </div>
    <div class="info-card">
      <div class="label">Tags / Categorias</div>
      <div class="value" style="font-size:12px; font-weight:400; margin-top:4px;">${tagsHtml || '<span style="color:#94a3b8;">Sem tags</span>'}</div>
    </div>
  </div>

  <!-- Checklist -->
  <section>
    <h2>☑ Checklist de Tarefas — ${checklistProgress.completed}/${checklistProgress.total} (${checklistProgress.percentage}%)</h2>
    <div class="progress-bar-bg">
      <div class="progress-bar-fill ${checklistProgress.percentage === 100 ? 'complete' : ''}" style="width:${checklistProgress.percentage}%;"></div>
    </div>
    ${
      (card.checklist || []).length > 0
        ? `<table><tbody>${checklistRows}</tbody></table>`
        : '<p style="color:#94a3b8; font-size:13px;">Nenhuma tarefa cadastrada.</p>'
    }
  </section>

  <!-- Anotações -->
  <section>
    <h2>📝 Anotações / Briefing / Roteiro</h2>
    <div class="notes-box">${card.notes?.trim() || '<span style="color:#94a3b8;">Sem anotações.</span>'}</div>
  </section>

  <!-- Arquivos Físicos -->
  <section>
    <h2>📎 Arquivos Histórico (${fileAttachments.length})</h2>
    <ul>${fileAttachmentsHtml}</ul>
  </section>

  <!-- Links -->
  <section>
    <h2>🔗 Links Externos (${linkAttachments.length})</h2>
    <ul>${linkAttachmentsHtml}</ul>
  </section>

  <!-- Footer -->
  <div class="footer">
    <span>Kambam · Pipeline de Conteúdo</span>
    <span>Gerado em ${generatedAt}</span>
    <span>ID: ${card.id}</span>
  </div>

</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Não foi possível abrir a janela de impressão. Verifique se o pop-up está bloqueado.');
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Auto-trigger print after load (small delay for render)
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
    }, 300);
  };
}
