type UpdateFn = (reloadPage?: boolean) => Promise<void>

let applyUpdate: UpdateFn | undefined

export function setPwaUpdateFn(fn: UpdateFn) {
  applyUpdate = fn
}

export function reloadForPwaUpdate() {
  void applyUpdate?.(true)
}
