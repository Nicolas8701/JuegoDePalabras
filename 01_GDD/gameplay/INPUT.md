# INPUT

Status: CANDIDATE IMPLEMENTED — 0.1.0-dev

- Physical keyboard and on-screen touch keyboard share one input path.
- Enter submits; Backspace deletes; letters append only up to target length.
- No hover-only critical action.
- UI blocks duplicate submit while a request is in flight.
- ES keyboard includes Ñ; EN hides Ñ.
- Invalid length/dictionary response shakes the active row and gives optional haptic/audio feedback.
- Gameplay state is server-time/state driven, not render-FPS driven.
