/**
 * JavaScript execution Web Worker.
 * Runs in an isolated thread — no access to DOM, fetch, or main thread globals.
 */
self.onmessage = async (e: MessageEvent<{ code: string; timeout: number }>) => {
	const { code, timeout } = e.data;
	const logs: string[] = [];

	// Create a sandboxed console
	const sandboxConsole = {
		log: (...args: any[]) => logs.push(args.map(String).join(' ')),
		error: (...args: any[]) => logs.push('[ERROR] ' + args.map(String).join(' ')),
		warn: (...args: any[]) => logs.push('[WARN] ' + args.map(String).join(' ')),
		info: (...args: any[]) => logs.push(args.map(String).join(' '))
	};

	try {
		const timer = setTimeout(() => {
			self.postMessage({
				success: false,
				output: logs.join('\n'),
				error: 'Execution timeout'
			});
		}, timeout);

		// Execute in a Function constructor for isolation
		const fn = new Function('console', code);
		fn(sandboxConsole);

		clearTimeout(timer);
		self.postMessage({
			success: true,
			output: logs.join('\n'),
			error: null
		});
	} catch (err: any) {
		self.postMessage({
			success: false,
			output: logs.join('\n'),
			error: err.message || String(err)
		});
	}
};
