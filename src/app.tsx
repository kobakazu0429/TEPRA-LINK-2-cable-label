import { useCallback, useMemo, useState } from "preact/hooks";
import "./app.css";
import { build } from "./tm";

type CableType = "lan" | "plain";

type LanLength = string;
type LanCategory = string;
type LanShielded = "UTP" | "STP";
type LanCore = "SOLID" | "TWISTED";
type LAN = {
  length: LanLength;
  category: LanCategory;
  shielded: LanShielded;
  core: LanCore;
};

const createBodyText = (lan: LAN) => {
  const l = lan.shielded.length - (lan.length.length + "m".length);
  const pad = " ".repeat(l);
  return `${lan.length}m ${pad}CAT${lan.category}\n${lan.shielded} ${lan.core}`;
};

const tm2Download = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data)], {
    type: "application/json",
  });
  const dummy = document.createElement("a");
  document.body.appendChild(dummy);
  dummy.href = URL.createObjectURL(blob);
  dummy.download = `${filename}.tm2`;
  dummy.click();
  document.body.removeChild(dummy);
};

export function App() {
  const [cableType, setCableType] = useState<CableType>("lan");
  const [plainText, setPlainText] = useState("");
  const [lan, setLAN] = useState<LAN>({
    category: "6",
    length: "5",
    core: "SOLID",
    shielded: "UTP",
  });

  const body = useMemo(() => {
    if (cableType === "plain") {
      return plainText;
    } else {
      return createBodyText(lan);
    }
  }, [cableType, plainText, lan]);

  const onDownload = useCallback(() => {
    // const result = {};
    const result = build({
      isAutoLength: true,
      margin: 1,
      // width,
      // height,
      text: body,
      tape: "SV36KN",
    });
    const filename = new Date()
      .toLocaleString()
      .replaceAll("/", "-")
      .replaceAll(":", "-")
      .replaceAll(" ", "_");
    tm2Download(result, filename);
  }, [body]);

  return (
    <>
      {/* @ts-expect-error */}
      <fieldset onChange={(e) => setCableType(e.target.value)}>
        <legend>Type</legend>

        <div>
          <input
            type="radio"
            id="lan"
            name="type"
            value="lan"
            checked={cableType === "lan"}
          />
          <label for="lan">LAN Cable</label>
        </div>

        <div>
          <input
            type="radio"
            id="plain"
            name="type"
            value="plain"
            checked={cableType === "plain"}
          />
          <label for="plain">Plain text</label>
        </div>
      </fieldset>

      <fieldset
        onChange={(e) => {
          // @ts-expect-error
          setLAN((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        }}
      >
        <legend>{cableType === "lan" ? "LAN Params" : "Text"}</legend>

        {cableType === "lan" ? (
          <>
            <div>
              Length:{" "}
              <input type="text" name="length" id="length" value={lan.length} />
              m
            </div>

            <div>
              CAT
              <input
                type="text"
                name="category"
                id="category"
                value={lan.category}
              />
            </div>

            <div>
              <input
                type="radio"
                id="utp"
                name="shielded"
                value="UTP"
                checked={lan.shielded === "UTP"}
              />
              <label for="utp">UTP (Unshielded Twist Pair cable)</label>
              <br />
              <input
                type="radio"
                id="stp"
                name="shielded"
                value="STP"
                checked={lan.shielded === "STP"}
              />
              <label for="stp">STP (Shielded Twist Pair cable)</label>
            </div>

            <div>
              <input
                type="radio"
                id="solid"
                name="core"
                value="SOLID"
                checked={lan.core === "SOLID"}
              />
              <label for="solid">単線(Solid)</label>
              <br />
              <input
                type="radio"
                id="twisted"
                name="core"
                value="TWISTED"
                checked={lan.core === "TWISTED"}
              />
              <label for="twisted">より線(Twisted)</label>
            </div>
          </>
        ) : (
          <textarea
            cols={30}
            rows={3}
            // @ts-expect-error
            onChange={(e) => setPlainText(e.target.value)}
          ></textarea>
        )}
      </fieldset>

      <div>
        <h2>Preview</h2>
        <pre>{body}</pre>
      </div>

      <div>
        <button onClick={onDownload}>DL</button>
      </div>
    </>
  );
}
