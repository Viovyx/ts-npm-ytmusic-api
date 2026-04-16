import type { ThumbnailFull } from "../types"

/**
 * Generates the highest resolution thumbnail for a given list of thumbnails.
 * @param thumbnails Must be thumbnails from the same content for the expected result.
 * @returns The highest resolution thumbnail or null if existing thumbnail has greater resolution.
 */
export default function (thumbnails: ThumbnailFull[]): ThumbnailFull | null {
    // Known hosts, used to parse original thumb link to highres version
    type hosts =
        | "lh3.googleusercontent.com"
        | "i.ytimg.com"
        | "yt3.googleusercontent.com"

    // The highest resolution thumbnail given in the item
    let highestOriginalThumb: ThumbnailFull = thumbnails.reduce((prev, curr) =>
        curr.width > prev.width ? curr : prev,
    )
    let url: string = highestOriginalThumb.url

    // Get the host, widht and height of the highest original thumbnail
    let host: hosts = new URL(highestOriginalThumb.url).host as hosts
    let width: number = highestOriginalThumb.width
    let height: number = highestOriginalThumb.height

    switch (host) {
        case "lh3.googleusercontent.com":
            // Replaces the width param with the highest resolution yt provides, removes other optional params
            width = 1200
            height = width
            url = url.split("=w")[0]! + `=w${width}`
            // Expected original url: https://lh3.googleusercontent.com/<some data>=w<original width>-h<original height>-p-l90-rj
            // Example of new url: https://lh3.googleusercontent.com/<some data>=w<max width>
            break

        case "yt3.googleusercontent.com":
            // Replaces the scale param with the highest resolution yt provides using width param, removes other optional params
            width = 1200
            height = width
            url = url.split("=s")[0]! + `=w${width}`
            // Expected original url: https://yt3.googleusercontent.com/<some data>=s<original width>
            // Example of new url: https://yt3.googleusercontent.com/<some data>=w<max width>
            break

        case "i.ytimg.com":
            // Changes sddefault.jpeg to maxresdefault.jpeg (best quality yt provides), remove optional params
            width = 1280
            height = 720
            url = url.replace("sddefault", "maxresdefault")
            url = url.includes("?") ? url.split("?")[0]! : url
            // Expected original url: https://i.ytimg.com/vi/<some data>/sddefault.jpg?sqp=<some data>
            // Example of new url: https://i.ytimg.com/vi/<some data>/maxresdefault.jpg
            break

        default:
            // Unknown host => do nothing
            // You can log the host to the console and, if possible, add a case for extracting a higher resolution thumbnail from it.
            // console.log(`DEBUG: Unknown host: '${host}'`)
            break
    }

    const ifBetterQuality: boolean =
        width * height >
        highestOriginalThumb.width * highestOriginalThumb.height
    return ifBetterQuality ? { url: url, width: width, height: height } : null
}
