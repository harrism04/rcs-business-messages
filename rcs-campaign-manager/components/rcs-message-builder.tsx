'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PlusCircle, Trash2, Phone, MapPin, Share, Link, Calendar, ChevronRight, ChevronLeft, Upload } from 'lucide-react'

type MessageType = 'text' | 'richCard' | 'carousel' | 'media'
type SuggestedAction = 'text' | 'dial' | 'viewLocation' | 'shareLocation' | 'openUrl' | 'createCalendar'

interface RichCard {
  title: string
  description: string
  media: { type: 'image' | 'video', url: string }
  suggestedReplies: string[]
  suggestedActions: { type: SuggestedAction, value: string }[]
}

interface RCSMessage {
  type: MessageType
  content: string | RichCard | RichCard[] | { type: 'image' | 'video' | 'audio' | 'pdf', url: string }
  fallback?: string
}

export function RcsMessageBuilder() {
  const [message, setMessage] = useState<RCSMessage>({ type: 'text', content: '' })
  const [activeTab, setActiveTab] = useState<MessageType>('text')
  const [previewIndex, setPreviewIndex] = useState(0)
  const [showFallback, setShowFallback] = useState(false)

  const handleTextChange = (content: string) => {
    setMessage({ ...message, type: 'text', content })
  }

  const handleRichCardChange = (card: RichCard) => {
    setMessage({ ...message, type: 'richCard', content: card })
  }

  const handleCarouselChange = (cards: RichCard[]) => {
    setMessage({ ...message, type: 'carousel', content: cards })
  }

  const handleMediaChange = (media: { type: 'image' | 'video' | 'audio' | 'pdf', url: string }) => {
    setMessage({ ...message, type: 'media', content: media })
  }

  const handleFallbackChange = (fallback: string) => {
    setMessage({ ...message, fallback })
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">RCS Message Builder</h1>
      <div className="flex gap-6">
        <Card className="flex-grow">
          <CardHeader>
            <CardTitle>Message Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MessageType)}>
              <TabsList className="grid w-full grid-cols-4 mb-4">
                {['text', 'richCard', 'carousel', 'media'].map((tab) => (
                  <TabsTrigger 
                    key={tab} 
                    value={tab}
                    className={`
                      ${activeTab === tab 
                        ? 'bg-blue-600 text-white font-bold shadow-md' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                      transition-all duration-200 ease-in-out
                      py-2 px-4 rounded-md
                    `}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="text">
                <TextMessageBuilder onChange={handleTextChange} />
              </TabsContent>
              <TabsContent value="richCard">
                <RichCardBuilder onChange={handleRichCardChange} />
              </TabsContent>
              <TabsContent value="carousel">
                <CarouselBuilder onChange={handleCarouselChange} />
              </TabsContent>
              <TabsContent value="media">
                <MediaUploader onChange={handleMediaChange} />
              </TabsContent>
            </Tabs>
            <div className="mt-4 flex items-center space-x-2">
              <Switch
                id="fallback-sms"
                checked={showFallback}
                onCheckedChange={setShowFallback}
              />
              <Label htmlFor="fallback-sms">Fallback SMS</Label>
            </div>
            {showFallback && (
              <div className="mt-2">
                <Textarea
                  placeholder="Enter fallback SMS for non-RCS capable recipients"
                  value={message.fallback || ''}
                  onChange={(e) => handleFallbackChange(e.target.value)}
                />
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button onClick={() => console.log('Send message', message)}>Send Message</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <PreviewPane message={message} activeIndex={previewIndex} onIndexChange={setPreviewIndex} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TextMessageBuilder({ onChange }: { onChange: (content: string) => void }) {
  const [text, setText] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    onChange(e.target.value)
  }

  return (
    <div>
      <Textarea
        placeholder="Enter your message (up to 3072 characters)"
        value={text}
        onChange={handleChange}
        maxLength={3072}
        className="h-40"
      />
      <div className="text-sm text-gray-500 mt-2">
        Characters: {text.length} / 3072
      </div>
    </div>
  )
}

function RichCardBuilder({ onChange }: { onChange: (card: RichCard) => void }) {
  const [card, setCard] = useState<RichCard>({
    title: '',
    description: '',
    media: { type: 'image', url: '' },
    suggestedReplies: [],
    suggestedActions: []
  })
  const [suggestedType, setSuggestedType] = useState<'replies' | 'actions' | null>(null)

  const handleChange = (field: keyof RichCard, value: any) => {
    const updatedCard = { ...card, [field]: value }
    setCard(updatedCard)
    if (isValidRichCard(updatedCard)) {
      onChange(updatedCard)
    }
  }

  const isValidRichCard = (card: RichCard): boolean => {
    return (!!card.title || (!!card.media.url && (card.media.type === 'image' || card.media.type === 'video'))) &&
           (card.suggestedReplies.length === 0 || card.suggestedActions.length === 0) &&
           (card.suggestedReplies.length <= 4 && card.suggestedActions.length <= 4)
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Card Title"
        value={card.title}
        onChange={(e) => handleChange('title', e.target.value)}
      />
      <Textarea
        placeholder="Card Description"
        value={card.description}
        onChange={(e) => handleChange('description', e.target.value)}
        className="h-24"
      />
      <MediaUploader
        onChange={(media) => handleChange('media', media)}
        allowedTypes={['image', 'video']}
      />
      <div>
        <Label>Suggested Type</Label>
        <Select 
          value={suggestedType || ''} 
          onValueChange={(value: 'replies' | 'actions') => setSuggestedType(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select suggested actions or replies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="replies">Suggested Replies</SelectItem>
            <SelectItem value="actions">Suggested Actions</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {suggestedType === 'replies' && (
        <SuggestedRepliesBuilder
          replies={card.suggestedReplies}
          onChange={(replies) => handleChange('suggestedReplies', replies)}
        />
      )}
      {suggestedType === 'actions' && (
        <SuggestedActionsBuilder
          actions={card.suggestedActions}
          onChange={(actions) => handleChange('suggestedActions', actions)}
        />
      )}
    </div>
  )
}

function CarouselBuilder({ onChange }: { onChange: (cards: RichCard[]) => void }) {
  const [cards, setCards] = useState<RichCard[]>([])

  const addCard = () => {
    if (cards.length < 10) {
      setCards([...cards, {
        title: '',
        description: '',
        media: { type: 'image', url: '' },
        suggestedReplies: [],
        suggestedActions: []
      }])
    }
  }

  const removeCard = (index: number) => {
    const updatedCards = cards.filter((_, i) => i !== index)
    setCards(updatedCards)
    onChange(updatedCards)
  }

  const updateCard = (index: number, updatedCard: RichCard) => {
    const updatedCards = cards.map((card, i) => i === index ? updatedCard : card)
    setCards(updatedCards)
    onChange(updatedCards)
  }

  return (
    <div className="space-y-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Card {index + 1}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => removeCard(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Card Title"
              value={card.title}
              onChange={(e) => updateCard(index, { ...card, title: e.target.value })}
              className="mb-2"
            />
            <Textarea
              placeholder="Card Description"
              value={card.description}
              onChange={(e) => updateCard(index, { ...card, description: e.target.value })}
              className="mb-2"
            />
            <MediaUploader
              onChange={(media) => {
                if (media.type === 'image' || media.type === 'video') {
                  updateCard(index, { ...card, media: { type: media.type, url: media.url } });
                }
              }}
              allowedTypes={['image', 'video']}
            />
          </CardContent>
        </Card>
      ))}
      {cards.length < 10 && (
        <Button onClick={addCard}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Card
        </Button>
      )}
    </div>
  )
}

function MediaUploader({ onChange, allowedTypes = ['image', 'video', 'audio', 'pdf'] }: { 
  onChange: (media: { type: 'image' | 'video' | 'audio' | 'pdf', url: string }) => void,
  allowedTypes?: ('image' | 'video' | 'audio' | 'pdf')[]
}) {
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'pdf'>(allowedTypes[0])
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedExtensions = {
    image: ['.jpeg', '.jpg', '.gif', '.png'],
    video: ['.h263', '.m4v', '.mp4', '.mpeg', '.mpg', '.webm'],
    audio: ['.ogx', '.aac', '.mp3', '.mpeg', '.mp4', '.3gp'],
    pdf: ['.pdf']
  }

  const allowedMimeTypes = {
    image: ['image/jpeg', 'image/gif', 'image/png'],
    video: ['video/h263', 'video/mp4', 'video/mpeg', 'video/webm'],
    audio: ['audio/ogg', 'audio/aac', 'audio/mpeg', 'audio/mp4', 'audio/3gpp'],
    pdf: ['application/pdf']
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const fileType = file.type.toLowerCase()

      if (allowedExtensions[mediaType].includes(fileExtension) && allowedMimeTypes[mediaType].includes(fileType)) {
        setError('')
        setFileName(file.name)
        const fakeUrl = URL.createObjectURL(file)
        onChange({ type: mediaType, url: fakeUrl })
      } else {
        setError(`Invalid file type. Allowed types: ${allowedExtensions[mediaType].join(', ')}`)
        setFileName('')
        e.target.value = ''
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {allowedTypes.length > 1 && (
        <div>
          <Label>Media Type</Label>
          <Select value={mediaType} onValueChange={(value: 'image' | 'video' | 'audio' | 'pdf') => setMediaType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select media type" />
            </SelectTrigger>
            <SelectContent>
              {allowedTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'pdf' ? 'PDF' : type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Label htmlFor="media-upload">Upload Media (max 200MB)</Label>
              <div className="flex items-center space-x-2">
                <Button 
                  type="button" 
                  onClick={handleButtonClick}
                  className="w-full justify-start text-left font-normal"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {fileName || 'Choose file'}
                </Button>
                <Input 
                  id="media-upload" 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleUpload} 
                  accept={allowedExtensions[mediaType].join(',')}
                  className="hidden"
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Supported file types: {allowedExtensions[mediaType].join(', ')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

function SuggestedRepliesBuilder({ replies, onChange }: { replies: string[], onChange: (replies: string[]) => void }) {
  const addReply = () => {
    if (replies.length < 4) {
      onChange([...replies, ''])
    }
  }

  const updateReply = (index: number, value: string) => {
    const updatedReplies = replies.map((reply, i) => i === index ? value : reply)
    onChange(updatedReplies)
  }

  const removeReply = (index: number) => {
    const updatedReplies = replies.filter((_, i) => i !== index)
    onChange(updatedReplies)
  }

  return (
    <div className="space-y-2">
      <Label>Suggested Replies (max 4)</Label>
      {replies.map((reply, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Input
            value={reply}
            onChange={(e) => updateReply(index, e.target.value)}
            placeholder={`Reply ${index + 1}`}
          />
          <Button variant="ghost" size="icon" onClick={() => removeReply(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="mt-4">
        {replies.length < 4 && (
          <Button onClick={addReply}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Reply
          </Button>
        )}
      </div>
    </div>
  )
}

function SuggestedActionsBuilder({ actions, onChange }: { actions: { type: SuggestedAction, value: string }[], onChange: (actions: { type: SuggestedAction, value: string }[]) => void }) {
  const addAction = () => {
    if (actions.length < 4) {
      onChange([...actions, { type: 'text', value: '' }])
    }
  }

  const updateAction = (index: number, field: 'type' | 'value', value: string) => {
    const updatedActions = actions.map((action, i) => i === index ? { ...action, [field]: value } : action)
    onChange(updatedActions)
  }

  const removeAction = (index: number) => {
    const updatedActions = actions.filter((_, i) => i !== index)
    onChange(updatedActions)
  }

  return (
    <div className="space-y-2">
      <Label>Suggested Actions (max 4)</Label>
      {actions.map((action, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Select value={action.type} onValueChange={(value: SuggestedAction) => updateAction(index, 'type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="dial">Dial</SelectItem>
              <SelectItem value="viewLocation">View Location</SelectItem>
              <SelectItem value="shareLocation">Share Location</SelectItem>
              <SelectItem value="openUrl">Open URL</SelectItem>
              <SelectItem value="createCalendar">Create Calendar Event</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={action.value}
            onChange={(e) => updateAction(index, 'value', e.target.value)}
            placeholder={`Action ${index + 1} value`}
          />
          <Button variant="ghost" size="icon" onClick={() => removeAction(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="mt-4">
        {actions.length < 4 && (
          <Button onClick={addAction}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Action
          </Button>
        )}
      </div>
    </div>
  )
}

function PreviewPane({ message, activeIndex, onIndexChange }: { message: RCSMessage, activeIndex: number, onIndexChange: (index: number) => void }) {
  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return <div className="p-4 bg-white rounded-lg shadow">{message.content as string}</div>
      case 'richCard':
        return <RichCardPreview card={message.content as RichCard} />
      case 'carousel':
        const cards = message.content as RichCard[]
        return (
          <div className="relative">
            <RichCardPreview card={cards[activeIndex]} />
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onIndexChange(Math.max(0, activeIndex - 1))}
                disabled={activeIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onIndexChange(Math.min(cards.length - 1, activeIndex + 1))}
                disabled={activeIndex === cards.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      case 'media':
        const media = message.content as { type: 'image' | 'video' | 'audio' | 'pdf', url: string }
        return (
          <div className="p-4 bg-white rounded-lg shadow">
            {media.type === 'image' && <img src={media.url} alt="Preview" className="max-w-full h-auto" />}
            {media.type === 'video' && <video src={media.url} controls className="max-w-full h-auto" />}
            {media.type === 'audio' && <audio src={media.url} controls />}
            {media.type === 'pdf' && <embed src={media.url} type="application/pdf" width="100%" height="300px" />}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '320px', margin: '0 auto' }}>
        {renderContent()}
      </div>
    </div>
  )
}

function RichCardPreview({ card }: { card: RichCard }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {card.media.type === 'image' && card.media.url && (
        <img src={card.media.url} alt={card.title} className="w-full h-48 object-cover" />
      )}
      {card.media.type === 'video' && card.media.url && (
        <video src={card.media.url} controls className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        {card.title && <h3 className="font-bold text-lg mb-2">{card.title}</h3>}
        {card.description && <p className="text-gray-700 text-sm mb-4">{card.description}</p>}
        {card.suggestedReplies.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Suggested Replies</h4>
            <div className="flex flex-wrap gap-2">
              {card.suggestedReplies.map((reply, index) => (
                <Button key={index} variant="outline" size="sm">{reply}</Button>
              ))}
            </div>
          </div>
        )}
        {card.suggestedActions.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Suggested Actions</h4>
            <div className="flex flex-wrap gap-2">
              {card.suggestedActions.map((action, index) => (
                <Button key={index} variant="outline" size="sm">
                  {action.type === 'dial' && <Phone className="mr-2 h-4 w-4" />}
                  {action.type === 'viewLocation' && <MapPin className="mr-2 h-4 w-4" />}
                  {action.type === 'shareLocation' && <Share className="mr-2 h-4 w-4" />}
                  {action.type === 'openUrl' && <Link className="mr-2 h-4 w-4" />}
                  {action.type === 'createCalendar' && <Calendar className="mr-2 h-4 w-4" />}
                  {action.value}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}