df.long <- read_csv("processedDat_disagree.csv")
df.sidebyside <- read_csv("processedDat_sidebyside.csv")
df.consensus <- read_csv("processedDat_consensus.csv")


glimpse(df.consensus)
View(df.consensus)
q1a.counts <- df.consensus %>%
  filter(CodeQNum == "1a") %>%
  count(comb)

q2a.counts <- df.consensus %>%
  filter(CodeQNum == "2a") %>%
  count(comb)

#plot
q2a.counts %>%
  ggplot(aes(x=comb, y=n)) +
  geom_bar(stat="identity") +
  ggtitle("When you were playing the game and you saw 0 red marbles,what would you tell\nthe other player?") +
  scale_x_discrete("response") +
  theme_bw()


q3.counts <- df.consensus %>%
  filter(CodeQNum == "3") %>%
  count(comb)

#plot
q3.counts %>%
  bind_rows(data.frame( #manually add in missing numbers
    comb = c("1","5"),
    n = c(0,0)
  )) %>%
  ggplot(aes(x=comb, y=n)) +
  geom_bar(stat="identity") +
  ggtitle("If you wanted to trick the other player (and you got 3 red marbles), what would\nyou do?") +
  scale_x_discrete("response") +
  theme_bw()

q4.counts <- df.consensus %>%
  filter(CodeQNum == "4") %>%
  count(comb)
