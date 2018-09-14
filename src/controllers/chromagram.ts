import meyda from "meyda";
import * as express from "express";
import * as fileUpload from "express-fileupload";
import WebAudioApi from "web-audio-api";

const AudioContext = WebAudioApi.AudioContext;


type UploadedFile = fileUpload.UploadedFile;
function isUploadedFile(file: UploadedFile | UploadedFile[]): file is UploadedFile {
    return typeof file === "object" && (<UploadedFile> file).name !== undefined;
}

export const getChromagram = async (req: express.Request, res: express.Response) => {
    try {
        const mapChroma = (chroma: string[], currentResults: any[]) => {
            const results = [...currentResults];
            chroma.map((chromaChord, index) => {
                if (Array.isArray(results[index])) {
                    results[index].push(chromaChord);
                } else {
                    results[index] = [chromaChord];
                }
            });
            return results;
        };

        const audioParser = (audioBuffer: any) => {
            const channelData = audioBuffer.getChannelData(0);
            const BufferRate = 512;

            let results: any[] = [];

            for (let i = 0; i < channelData.length - BufferRate; i += BufferRate) {
                const chroma = meyda.extract("chroma", channelData.slice(i, i + BufferRate));
                results = mapChroma(chroma, results);
            }

            res.status(200).send(results);
        };

        const errorHandler = (error: any) => {
            res.status(500).send(error.message);
        };

        if (!req.files) {
            return res.status(400).send("No files were uploaded.");
        }
        if (typeof req.files === "object") {
            const audioFile = req.files.audio;

            if (!audioFile) {
                return res.status(400).send(`Missing "audio" in your body`);
            }

            if (isUploadedFile(audioFile)) {
                if (!audioFile.name || audioFile.name === "") {
                    return res.status(400).send("No file name");
                }
            } else {
                return res.status(400).send("Invalid File Format");
            }

            if (!audioFile.mimetype.includes("audio")) {
                return res.status(400).send("invalid audio file");
            }

            const offlineContext = new AudioContext;
            const sourceBuffer = new Uint8Array(audioFile.data).buffer;
            offlineContext.decodeAudioData(sourceBuffer, audioParser, errorHandler);
        } else {
            return res.status(400).send(`Multiple files aren't supported at the moment`);
        }
    } catch (er) {
        return res.status(500).send(er.message);
    }
};
