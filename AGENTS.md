# NO DELAY Development Rules

## Product Principle

This product reduces the distance between “I need to do something” and “I started doing it.” Every feature should reduce friction, hesitation, choice overload, or distraction.

If a feature increases complexity without helping the user start, do not add it.

## Coding Rules

- Use strict TypeScript and avoid `any`.
- Keep business logic outside visual components when it can be isolated.
- Persist important user state.
- Timer logic must survive tab switching and browser throttling by using timestamps.
- Keep the MVP local-first and avoid unnecessary dependencies.
- Preserve a clean boundary for a future storage backend.
- Run lint, typecheck, and production build before handoff.

## UI Rules

- Visual identity: Brutalist, industrial, raw, high contrast.
- Prefer black, warm white, warning red, and restrained acid green.
- Avoid pastel colors, excessive cards, generic SaaS dashboards, gradients, and excessive border radius.
- Typography is a primary visual element.
- Animation must communicate impact, progress, or completion.

## UX Rule

Every major screen has one obvious primary action:

- Opening: break the brick.
- Today: start the next task.
- Focus: keep focusing.
- Break: rest.

Never create unnecessary choices.
