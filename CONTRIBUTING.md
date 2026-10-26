# Contributing

Thanks for helping with the CLPR website. Every commit that lands on `main` must be **signed off
(DCO)** and **cryptographically signed (GPG)**. Both are enforced on the repository.

## Developer Certificate of Origin (DCO)

By signing off a commit you certify that you wrote it or otherwise have the right to submit it under
the project's license, as described in the [Developer Certificate of Origin](https://developercertificate.org/).

Sign off by adding `-s` to every commit:

```sh
git commit -s -m "Fix hero animation on Safari"
```

This appends a trailer that must match the commit author:

```
Signed-off-by: Jane Doe <jane@example.com>
```

The **DCO** check fails on pull requests that contain a commit without a matching sign-off. To fix
commits you have already made:

```sh
# last commit only
git commit --amend --no-edit -s

# every commit on your branch
git rebase --signoff main
git push --force-with-lease
```

## Signed commits

`main` only accepts commits with a verified signature. Set up GPG signing once:

1. Create a key (`gpg --full-generate-key`) using the email address of your GitHub account, or reuse
   an existing one.
2. Add the public key to GitHub: `gpg --armor --export <KEY_ID>`, then paste it under
   [Settings → SSH and GPG keys](https://github.com/settings/keys).
3. Tell git to sign every commit:

   ```sh
   git config --global user.signingkey <KEY_ID>
   git config --global commit.gpgsign true
   ```

See GitHub's guide on [signing commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)
for details. SSH signing also works if you prefer it.

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Run the checks locally before you push:

   ```sh
   pnpm install
   pnpm lint
   pnpm typecheck
   pnpm build
   ```

3. Open a pull request against `main`. Force pushes to and deletion of `main` are blocked.
