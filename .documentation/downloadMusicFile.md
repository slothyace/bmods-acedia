# Download Audio Track
This mod downloads audio from a YouTube / SoundCloud link.
![](https://github.com/slothyace/bmods-acedia/blob/main/.documentation/.images/downloadMusicFile.png)

## Requirements
| Requirements | Where It Should Be Placed In Project Folder |
| --- | --- |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | Same folder as `bot.js` |
| All [ffmpeg](https://www.ffmpeg.org/download.html) related stuff, mainly the binary (ffmpeg/ffprobe/ffplay). | Same folder as `bot.js` |

## Documentation
Inputs
| Component | Documentation |
| --- | --- |
| `Audio Source Link` | Link to the audio source.<br>Can be YouTube or SoundCloud, Spotify is not supported. |
| `Audio Format` | Audio format to download in.<br>Recommended is `mp3` for its file size. |
| `Storage Path` | Where to store the downloaded audio file in the project folder, seperated by `:`.<br>*i.e.* If I want it stored in `./Music/Folder`, input `Music:Folder`. |

Outputs
| Component | Documentation |
| --- | --- |
| `Final File Name` | Store the file name of the audio file as, pretty self explainatory. |
| `Final File Path` | Path to the file, it'll be formatted as `path/to/audioFile.format`. |
| `Final File` | Reads the file and saves the `Buffer` to a variable.<br>Allows it to be played directly using the `Play Binary Variable` action developed for this mod. |

Options
| Component | Documentation |
| --- | --- |
| `Delete File After` | If toggled to `Yes`, it'll delete the file immediately after.<br>When used in tandem with the `Final File` output, it will not store the file on the system. |

Advanced Options
| Component | Documentation |
| --- | --- |
| `Cookies` | Toggle on to use cookies from the browser, I myself am not sure how to properly format this line to make it pass off properly. |
| `Custom File Name` | Toggle on to allow for custom file names.<br>[Documentation](https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#output-template) |
| `Other Arguments` | This passes off additional arguments to the command-line, can be used to enable other things.<br>[Documentation](https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#usage-and-options) |

Debugging
| Component | Documentation |
| --- | --- |
| `Print Debug Statements` | When toggled on, will print whatever the command line outputs as well as the command executed to download the audio. |