// Meringkas error axios/Node menjadi objek kecil yang layak masuk log.
//
// Melempar error axios mentah ke logger akan menserialisasi seluruh rantai
// request: soket TLS, agent, tabel STATUS_CODES, buffer sesi. Satu kegagalan
// bisa menghasilkan ribuan baris log dan menenggelamkan informasi yang
// sebenarnya dibutuhkan.
export function describeError(error) {
    if (!error) return { message: "unknown error" };

    const described = {
        message: error.message ?? String(error),
    };

    if (error.code) described.code = error.code;

    // Bentuk khas error axios.
    if (error.config) {
        described.method = error.config.method?.toUpperCase();
        described.url = (error.config.baseURL ?? "") + (error.config.url ?? "");
    }

    if (error.response) {
        described.status = error.response.status;

        // Body upstream sering menjelaskan penolakan (mis. halaman tantangan
        // bot). Dipotong supaya tidak jadi masalah baru di log.
        const data = error.response.data;
        if (data) {
            const text = typeof data === "string" ? data : JSON.stringify(data);
            described.body = text.slice(0, 300);
        }
    }

    return described;
}
