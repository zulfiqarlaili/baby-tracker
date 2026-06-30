# Baby Kick Counter

A private, offline-first baby movement log built as an installable React PWA. Movement history stays in the browser unless it is manually exported as a JSON backup.

## Run locally

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm test
npm run lint
npm run build
```

`npm run icons` regenerates the PWA and Apple touch icons.

## Tracking behavior

- A tracking day rolls over at 9:00am in the device’s local timezone.
- Movements logged before 9:00am belong to the previous tracking day.
- The tenth movement is a celebratory logging milestone, not a medical assessment.
- JSON restore validates the whole file before atomically merging new event IDs.

If a baby’s movements slow, stop, or change from their normal pattern, contact a midwife or maternity unit immediately.
