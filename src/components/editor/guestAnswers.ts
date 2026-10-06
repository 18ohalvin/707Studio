/**
 * What a guest types is runtime state, never part of the design. Text answers
 * are cleared before a project is saved and before a live page is shown, so a
 * value typed while testing can never reach the server or prefill a guest's
 * form. Choice selections are left alone: designers set "pre-selected"
 * options on purpose, and preview restores them on exit (see editorStore).
 */
export function stripTextAnswers<T extends { widget_tree?: any[] }>(pages: T[]): T[] {
  for (const page of pages) {
    for (const w of page.widget_tree || []) {
      if (!w?.props) continue;
      if (w.type === 'FieldInput' && w.props.value) w.props.value = '';
      if (w.type === 'RegistrationForm' && Array.isArray(w.props.fields)) {
        w.props.fields.forEach((f: any) => {
          if (f.value) f.value = '';
          if (f.errorMessage) delete f.errorMessage;
        });
      }
      if (w.props.modalProps?.fieldValue) w.props.modalProps.fieldValue = '';
      if (w.type === 'ModalOverlay' && w.props.fieldValue) w.props.fieldValue = '';
    }
  }
  return pages;
}
