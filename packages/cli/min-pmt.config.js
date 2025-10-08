export default {
  folder: 'pmt',
  states: {
    todo: {
      color: '#6b7280',
      order: 1,
    },
    'in-progress': {
      color: '#3b82f6',
      order: 2,
    },
    done: {
      color: '#10b981',
      order: 3,
    },
  },
  schema: {
    title: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      required: false,
    },
    status: {
      type: 'string',
      required: true,
      enum: ['todo', 'in-progress', 'done'],
    },
    priority: {
      type: 'string',
      required: false,
      enum: ['low', 'medium', 'high', 'critical'],
    },
    labels: {
      type: 'array',
      required: false,
      items: 'string',
    },
    assignee: {
      type: 'string',
      required: false,
    },
    created: {
      type: 'date',
      required: true,
    },
    updated: {
      type: 'date',
      required: true,
    },
    due: {
      type: 'date',
      required: false,
    },
  },
  template: {
    defaultStatus: 'todo',
    generateId: true,
    idPrefix: 'ticket-',
    content:
      '## Description\n\n[Add your description here]\n\n## Acceptance Criteria\n\n- [ ] Criteria 1\n- [ ] Criteria 2\n\n## Notes\n\n[Add any additional notes here]',
  },
};
