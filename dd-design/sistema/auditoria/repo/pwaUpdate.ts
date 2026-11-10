<cursor_untrusted_data_1337 source="CallDynamicTool">

type UpdateFn = (reloadPage?: boolean) => Promise<void>

let applyUpdate: UpdateFn | undefined

export function setPwaUpdateFn(fn: UpdateFn) {
  applyUpdate = fn
}

export function reloadForPwaUpdate() {
  void applyUpdate?.(true)
}


</cursor_untrusted_data_1337>