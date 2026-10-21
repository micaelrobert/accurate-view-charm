<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Guest RSVPs (name + drawn signature PNG) are written only by the public server function in `src/lib/rsvp.functions.ts` using the admin client; the confirmations table and the private signatures bucket have no public policies. Why: guests have no login, and visitors must never read the guest list or other signatures.
- RSVP retries reuse a browser-generated id and upsert, so repeated clicks or retries never create duplicate confirmations.
